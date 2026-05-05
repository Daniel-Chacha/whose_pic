import Link from "next/link";
import type { ReactNode } from "react";
import { auth } from "@/lib/auth";
import { SignOutButton } from "@/components/SignOutButton";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  return (
    <>
      <header className="border-b border-stone-200 dark:border-stone-800">
        <nav className="mx-auto flex max-w-5xl items-center gap-6 px-4 py-3">
          <Link href="/gallery" className="font-semibold">WhosePic</Link>
          {session?.user && (
            <>
              <Link href="/upload" className="text-sm hover:underline">Upload</Link>
              <Link href="/people" className="text-sm hover:underline">People</Link>
              <span className="ml-auto"><SignOutButton /></span>
            </>
          )}
        </nav>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </>
  );
}
