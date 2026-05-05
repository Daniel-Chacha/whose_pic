import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import PostgresAdapter from "@auth/pg-adapter";
import { Pool } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";

declare module "next-auth" {
  interface Session {
    user: { id: string } & DefaultSession["user"];
  }
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: PostgresAdapter(pool),
  session: { strategy: "jwt" },
  trustHost: true,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        action: {},
      },
      async authorize(creds) {
        const email = String(creds?.email ?? "").trim().toLowerCase();
        const password = String(creds?.password ?? "");
        const action = String(creds?.action ?? "signin");
        if (!email || !password) return null;

        const client = await pool.connect();
        try {
          const existing = await client.query<{ id: string; hashed_password: string | null }>(
            `select id, hashed_password from users where email = $1`,
            [email],
          );

          if (action === "signup") {
            if (existing.rowCount && existing.rowCount > 0) return null;
            const hash = await bcrypt.hash(password, 10);
            const inserted = await client.query<{ id: string }>(
              `insert into users (email, hashed_password) values ($1, $2) returning id`,
              [email, hash],
            );
            return { id: inserted.rows[0].id, email };
          }

          if (!existing.rowCount || !existing.rows[0].hashed_password) return null;
          const ok = await bcrypt.compare(password, existing.rows[0].hashed_password);
          if (!ok) return null;
          return { id: existing.rows[0].id, email };
        } finally {
          client.release();
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.sub = user.id;
      return token;
    },
    async session({ session, token }) {
      if (token.sub) session.user.id = token.sub;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});
