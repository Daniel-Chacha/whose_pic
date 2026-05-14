const faces = [
  {
    cls: "mock-face-1",
    name: "Amara",
    frame: "border-secondary-600",
    chip: "border-secondary-400 bg-secondary-50 text-secondary-800",
    dashed: false,
  },
  {
    cls: "mock-face-2",
    name: "Kwame",
    frame: "border-secondary-600",
    chip: "border-secondary-400 bg-secondary-50 text-secondary-800",
    dashed: false,
  },
  {
    cls: "mock-face-3",
    name: "Thabo",
    frame: "border-accent-400",
    chip: "border-accent-400 bg-accent-50 text-accent-900",
    dashed: true,
  },
];

export function Mockup() {
  return (
    <section className="px-4 pb-24">
      <div className="mx-auto max-w-4xl">
        <div className="relative rounded-xl border border-neutral-100 bg-white/85 p-6 shadow-2xl shadow-primary-600/10 backdrop-blur-sm">
          <div className="flex items-center gap-1.5 pb-4">
            <span className="h-2.5 w-2.5 rounded-full bg-primary-600" />
            <span className="h-2.5 w-2.5 rounded-full bg-secondary-600" />
            <span className="h-2.5 w-2.5 rounded-full bg-accent-400" />
            <span className="ml-3 text-xs font-medium text-neutral-400">
              3 people &middot; 6 photos &middot; this session
            </span>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {faces.map((f) => (
              <div
                key={f.name}
                className="relative aspect-square overflow-hidden rounded-xl bg-neutral-100"
              >
                <div
                  className={`mock-face ${f.cls} h-full w-full`}
                  role="img"
                  aria-label={`Photo of ${f.name}`}
                />
                <div
                  className={`pointer-events-none absolute inset-1 rounded-lg border-2 ${f.frame} ${
                    f.dashed ? "border-dashed" : ""
                  }`}
                />
                <span
                  className={`absolute left-2 top-2 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold ${f.chip}`}
                >
                  {f.dashed ? `Suggested: ${f.name}` : f.name}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
            <Pill color="bg-secondary-600" label="Labelled" />
            <Pill color="bg-accent-400" label="Needs a name" />
            <Pill color="bg-primary-600" label="Selected" />
          </div>
        </div>
      </div>
    </section>
  );
}

function Pill({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-neutral-100 bg-white px-3 py-2">
      <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
      <span className="text-neutral-900">{label}</span>
    </div>
  );
}
