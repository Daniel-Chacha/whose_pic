export function Privacy() {
  return (
    <section className="px-4 py-24">
      <div className="mx-auto max-w-3xl rounded-xl border border-secondary-400 bg-secondary-50/90 p-8 backdrop-blur-sm sm:p-12">
        <div className="flex items-start gap-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary-600 text-white shadow-md">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
              <path
                d="M12 3 4 6v6c0 4.5 3.4 8.4 8 9 4.6-.6 8-4.5 8-9V6l-8-3Z"
                strokeLinejoin="round"
              />
              <path d="m9 12 2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <div>
            <h2 className="text-xl font-semibold text-secondary-800">
              It never leaves your device.
            </h2>
            <p className="mt-3 text-sm text-secondary-800">
              There is no account, no server, and no upload. Face detection runs
              entirely in your browser, and your photos and labels are kept only in
              local browser storage for the life of this session. Close the site and
              it&apos;s gone &mdash; nothing is ever sent anywhere.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
