import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/Logo";
import { SessionGate } from "@/components/SessionGate";
import { ClearSessionButton } from "@/components/ClearSessionButton";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <header className="border-b border-neutral-100 bg-white/80 backdrop-blur">
        <nav className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-3">
          <Link
            href="/gallery"
            className="flex items-center gap-2 text-lg font-semibold text-primary-900"
          >
            <Logo className="h-7 w-7" />
            WhosePic
          </Link>
          <ClearSessionButton />
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <SessionGate>{children}</SessionGate>
      </main>
    </>
  );
}
