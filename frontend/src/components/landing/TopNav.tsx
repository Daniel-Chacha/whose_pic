import Link from "next/link";
import { Logo } from "@/components/Logo";

export function TopNav() {
  return (
    <header className="absolute inset-x-0 top-0 z-20">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link href="/" className="flex items-center gap-2.5">
          <Logo className="h-10 w-10" />
          <span className="bg-gradient-to-r from-primary-600 via-magenta-600 to-secondary-600 bg-clip-text font-serif text-3xl font-bold tracking-tight text-transparent">
            WhosePic
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/gallery"
            className="inline-flex h-9 items-center rounded-lg bg-primary-600 px-4 text-sm font-medium text-white shadow-lg shadow-primary-600/30 transition-colors hover:bg-primary-900"
          >
            Open the app
          </Link>
        </div>
      </nav>
    </header>
  );
}
