import Link from "next/link";

export function Hero() {
  return (
    <section className="relative overflow-hidden px-4 pb-24 pt-20 sm:pt-32">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-b from-primary-100 via-magenta-50 to-transparent"
      />
      <div
        aria-hidden
        className="absolute -top-32 left-1/2 -z-10 h-96 w-[120%] -translate-x-1/2 rounded-full bg-gradient-to-r from-primary-400 via-magenta-400 to-secondary-400 opacity-60 blur-3xl"
      />
      <div className="mx-auto max-w-3xl text-center">
        {/* <span className="inline-flex items-center gap-2 rounded-full border border-secondary-400 bg-white/90 px-3 py-1 text-xs font-medium text-secondary-800 shadow-sm backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full bg-secondary-600" />
          Face recognition that runs entirely in your browser
        </span> */}
        <h1 className="mx-auto mt-6 max-w-3xl text-balance text-xl font-bold tracking-tight text-primary-900 sm:text-4xl md:text-3xl">
          Add your photos. Tag a face once.{" "}
          <span className="bg-gradient-to-r from-primary-600 via-magenta-600 to-secondary-600 bg-clip-text text-transparent">
            WhosePic
          </span>{" "}
          finds them in every other picture &mdash; instantly, and without a
          single pic leaving your device.
        </h1>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/gallery"
            className="inline-flex h-11 items-center justify-center rounded-lg bg-primary-600 px-6 text-sm font-medium text-white shadow-lg shadow-primary-600/30 transition-colors hover:bg-primary-900"
          >
            Add your first photo
          </Link>
          <Link
            href="/gallery"
            className="inline-flex h-11 items-center justify-center rounded-lg border-[1.5px] border-primary-400 bg-white/80 px-6 text-sm font-medium text-primary-600 backdrop-blur transition-colors hover:bg-primary-50"
          >
            Try it out
          </Link>
        </div>
        <p className="mt-4 text-xs text-neutral-400">
          No account. No upload. Close the tab and it&apos;s gone.
        </p>
      </div>
    </section>
  );
}
