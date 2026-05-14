import Link from "next/link";

export function FinalCTA() {
  return (
    <section className="px-4 pb-24">
      <div className="relative mx-auto max-w-4xl overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600 via-magenta-600 to-secondary-600 px-6 py-16 text-center text-white shadow-2xl shadow-primary-600/30">
        <div
          aria-hidden
          className="absolute -inset-x-20 -top-32 h-64 rounded-full bg-white/20 blur-3xl"
        />
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Stop scrolling. Start finding.
        </h2>
        <p className="mx-auto mt-3 max-w-md text-white/90">
          Make a batch of photos searchable in seconds &mdash; right here, nothing to install.
        </p>
        <Link
          href="/gallery"
          className="mt-8 inline-flex h-12 items-center justify-center rounded-lg bg-white px-8 text-sm font-semibold text-primary-600 transition-colors hover:bg-neutral-50"
        >
          Try it now
        </Link>
      </div>
      <p className="mt-8 text-center text-xs text-neutral-400">
        WhosePic &middot; runs entirely in your browser with Next.js and face-api.js.
      </p>
    </section>
  );
}
