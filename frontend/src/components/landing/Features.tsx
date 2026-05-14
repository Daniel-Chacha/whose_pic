const items = [
  {
    title: "Detects every face",
    body: "Add a photo and the in-browser model finds each face automatically &mdash; no clicking, no cropping.",
    tint: "bg-primary-600",
    icon: (
      <path
        d="M4 7V5a1 1 0 0 1 1-1h2M20 7V5a1 1 0 0 0-1-1h-2M4 17v2a1 1 0 0 0 1 1h2M20 17v2a1 1 0 0 1-1 1h-2M9 11a3 3 0 1 0 6 0 3 3 0 0 0-6 0Zm-2 6c.6-1.8 2.5-3 5-3s4.4 1.2 5 3"
        strokeLinecap="round"
      />
    ),
  },
  {
    title: "Tag once, find everywhere",
    body: "Name a face and we instantly surface every other photo of that person in this session.",
    tint: "bg-secondary-600",
    icon: (
      <path
        d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0Zm6 0 2 2 4-4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  {
    title: "Smart suggestions",
    body: "When a new photo lands, we propose labels we already know &mdash; you confirm with one click.",
    tint: "bg-accent-400",
    icon: (
      <path
        d="M12 3v3m0 12v3M3 12h3m12 0h3M5.6 5.6l2.1 2.1m8.6 8.6 2.1 2.1m0-12.8-2.1 2.1m-8.6 8.6L5.6 18.4"
        strokeLinecap="round"
      />
    ),
  },
];

export function Features() {
  return (
    <section className="px-4 pb-24">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
          Built for the way you actually browse photos.
        </h2>
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {items.map((it) => (
            <div
              key={it.title}
              className="rounded-xl border border-neutral-100 bg-white/85 p-6 backdrop-blur-sm transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary-600/10"
            >
              <span
                className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${it.tint} text-white shadow-md`}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                  {it.icon}
                </svg>
              </span>
              <h3 className="mt-4 text-lg font-semibold">{it.title}</h3>
              <p
                className="mt-2 text-sm text-neutral-400"
                dangerouslySetInnerHTML={{ __html: it.body }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
