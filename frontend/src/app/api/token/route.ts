import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const token = jwt.sign(
    { sub: session.user.id, aud: "whosepic-api" },
    process.env.BACKEND_JWT_SECRET!,
    { algorithm: "HS256", expiresIn: "15m" },
  );
  return NextResponse.json({ token });
}
