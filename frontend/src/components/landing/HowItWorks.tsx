const steps = [
  {
    n: "01",
    t: "Add your photos",
    b: "Drop in one photo, several at once, or a whole folder. Nothing is uploaded &mdash; every image is read right in your browser.",
  },
  {
    n: "02",
    t: "Faces are detected",
    b: "The in-browser model finds every face in each photo and draws a box around it &mdash; no cropping, no clicking.",
  },
  {
    n: "03",
    t: "Name a face once",
    b: "Click a bounding box and type a name. That label sticks for the rest of your session.",
  },
  {
    n: "04",
    t: "Find them everywhere",
    b: "WhosePic matches that face across all your photos, groups them under People, and suggests the name on new ones.",
  },
];

export function HowItWorks() {
  return (
    <section className="border-y border-neutral-100 bg-white/70 px-4 py-24 backdrop-blur-sm">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
          How it works
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-sm text-neutral-400">
          Four steps, start to finish &mdash; and every one of them happens on
          your device.
        </p>
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <div key={s.n} className="relative">
              <span className="bg-gradient-to-br from-primary-600 via-magenta-600 to-secondary-600 bg-clip-text font-serif text-5xl font-bold text-transparent">
                {s.n}
              </span>
              <h3 className="mt-3 text-lg font-semibold">{s.t}</h3>
              <p
                className="mt-2 text-sm text-neutral-400"
                dangerouslySetInnerHTML={{ __html: s.b }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
