import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function LandingPage() {
  const session = await auth();
  if (session?.user) redirect("/gallery");

  return (
    <>
      <TopNav />
      <Hero />
      <Mockup />
      <Features />
      <HowItWorks />
      <Privacy />
      <FinalCTA />
    </>
  );
}

function TopNav() {
  return (
    <header className="absolute inset-x-0 top-0 z-20">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link href="/" className="text-base font-semibold tracking-tight">
          WhosePic
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-medium text-stone-700 hover:text-stone-900 dark:text-stone-300 dark:hover:text-white"
          >
            Sign in
          </Link>
          <Link
            href="/login?next=/gallery"
            className="inline-flex h-9 items-center rounded-full bg-stone-900 px-4 text-sm font-medium text-white transition hover:bg-stone-800 dark:bg-white dark:text-stone-900 dark:hover:bg-stone-100"
          >
            Get started
          </Link>
        </div>
      </nav>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden px-4 pb-24 pt-20 sm:pt-32">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-b from-rose-50/60 via-amber-50/40 to-transparent dark:from-indigo-950/40 dark:via-stone-950 dark:to-stone-950"
      />
      <div
        aria-hidden
        className="absolute -top-32 left-1/2 -z-10 h-96 w-[120%] -translate-x-1/2 rounded-full bg-gradient-to-r from-fuchsia-300/30 via-indigo-300/30 to-cyan-300/30 blur-3xl dark:from-fuchsia-500/10 dark:via-indigo-500/10 dark:to-cyan-500/10"
      />
      <div className="mx-auto max-w-3xl text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white/80 px-3 py-1 text-xs font-medium text-stone-700 shadow-sm backdrop-blur dark:border-stone-800 dark:bg-stone-900/60 dark:text-stone-300">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          AI face recognition for your private photo library
        </span>
        <h1 className="mt-6 text-balance text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl">
          Find every photo of{" "}
          <span className="bg-gradient-to-r from-fuchsia-500 via-indigo-500 to-cyan-500 bg-clip-text text-transparent">
            anyone
          </span>
          .
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-pretty text-lg text-stone-600 dark:text-stone-400">
          Upload your photos. Tag a face once. WhosePic finds them in every other picture &mdash; instantly, privately, and just for you.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/login?next=/gallery"
            className="inline-flex h-11 items-center justify-center rounded-full bg-stone-900 px-6 text-sm font-medium text-white shadow-lg shadow-stone-900/20 transition hover:bg-stone-800 dark:bg-white dark:text-stone-900 dark:shadow-white/10 dark:hover:bg-stone-100"
          >
            Get started &mdash; free
          </Link>
          <Link
            href="/login"
            className="inline-flex h-11 items-center justify-center rounded-full border border-stone-300 bg-white px-6 text-sm font-medium text-stone-900 transition hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 dark:hover:bg-stone-800"
          >
            Sign in
          </Link>
        </div>
        <p className="mt-4 text-xs text-stone-500">
          No credit card. Your photos stay yours.
        </p>
      </div>
    </section>
  );
}

function Mockup() {
  return (
    <section className="px-4 pb-24">
      <div className="mx-auto max-w-4xl">
        <div className="relative rounded-2xl border border-stone-200 bg-gradient-to-br from-white to-stone-50 p-6 shadow-2xl shadow-indigo-500/5 dark:border-stone-800 dark:from-stone-900 dark:to-stone-950">
          <div className="flex items-center gap-1.5 pb-4">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
          </div>
          <svg
            viewBox="0 0 800 360"
            className="aspect-[800/360] w-full rounded-lg"
            xmlns="http://www.w3.org/2000/svg"
            role="img"
            aria-label="Mockup showing detected and labelled faces in a photo"
          >
            <defs>
              <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#fce7f3" />
                <stop offset="50%" stopColor="#e0e7ff" />
                <stop offset="100%" stopColor="#cffafe" />
              </linearGradient>
              <linearGradient id="bgDark" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#3b0764" />
                <stop offset="50%" stopColor="#1e1b4b" />
                <stop offset="100%" stopColor="#082f49" />
              </linearGradient>
            </defs>
            <rect width="800" height="360" fill="url(#bg)" className="dark:hidden" />
            <rect width="800" height="360" fill="url(#bgDark)" className="hidden dark:block" />

            {/* Stylised silhouettes */}
            <g opacity="0.85">
              <circle cx="220" cy="160" r="48" fill="#fff" fillOpacity="0.7" />
              <ellipse cx="220" cy="260" rx="62" ry="50" fill="#fff" fillOpacity="0.7" />
              <circle cx="400" cy="150" r="52" fill="#fff" fillOpacity="0.7" />
              <ellipse cx="400" cy="260" rx="68" ry="55" fill="#fff" fillOpacity="0.7" />
              <circle cx="580" cy="170" r="46" fill="#fff" fillOpacity="0.7" />
              <ellipse cx="580" cy="265" rx="60" ry="48" fill="#fff" fillOpacity="0.7" />
            </g>

            {/* Bounding boxes + labels */}
            <g fill="none" strokeWidth="2.5">
              <g stroke="#3b82f6">
                <rect x="172" y="112" width="96" height="100" rx="6" />
                <rect x="172" y="92" width="56" height="18" rx="4" fill="#3b82f6" />
                <text x="178" y="106" fontSize="12" fill="#fff" fontFamily="ui-sans-serif, system-ui, sans-serif" fontWeight="600">Alice</text>
              </g>
              <g stroke="#22c55e">
                <rect x="348" y="98" width="104" height="108" rx="6" />
                <rect x="348" y="78" width="56" height="18" rx="4" fill="#22c55e" />
                <text x="354" y="92" fontSize="12" fill="#fff" fontFamily="ui-sans-serif, system-ui, sans-serif" fontWeight="600">Mara</text>
              </g>
              <g stroke="#f59e0b" strokeDasharray="4 3">
                <rect x="534" y="124" width="92" height="98" rx="6" />
                <rect x="534" y="104" width="92" height="18" rx="4" fill="#f59e0b" />
                <text x="540" y="118" fontSize="12" fill="#fff" fontFamily="ui-sans-serif, system-ui, sans-serif" fontWeight="600">Suggested: Sam</text>
              </g>
            </g>
          </svg>
          <div className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
            <Pill color="bg-blue-500" label="Labelled" />
            <Pill color="bg-emerald-500" label="Confirmed" />
            <Pill color="bg-amber-500" label="Suggested by similarity" />
          </div>
        </div>
      </div>
    </section>
  );
}

function Pill({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-stone-200 bg-white px-3 py-2 dark:border-stone-800 dark:bg-stone-900">
      <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
      <span className="text-stone-700 dark:text-stone-300">{label}</span>
    </div>
  );
}

function Features() {
  const items = [
    {
      title: "Detects every face",
      body: "Upload a photo and InsightFace finds each face automatically &mdash; no clicking, no cropping.",
      icon: (
        <path
          d="M4 7V5a1 1 0 0 1 1-1h2M20 7V5a1 1 0 0 0-1-1h-2M4 17v2a1 1 0 0 0 1 1h2M20 17v2a1 1 0 0 1-1 1h-2M9 11a3 3 0 1 0 6 0 3 3 0 0 0-6 0Zm-2 6c.6-1.8 2.5-3 5-3s4.4 1.2 5 3"
          strokeLinecap="round"
        />
      ),
    },
    {
      title: "Tag once, find everywhere",
      body: "Name a face and we instantly surface every other photo of that person across your library.",
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
      icon: (
        <path
          d="M12 3v3m0 12v3M3 12h3m12 0h3M5.6 5.6l2.1 2.1m8.6 8.6 2.1 2.1m0-12.8-2.1 2.1m-8.6 8.6L5.6 18.4"
          strokeLinecap="round"
        />
      ),
    },
  ];

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
              className="rounded-xl border border-stone-200 bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-lg dark:border-stone-800 dark:bg-stone-900"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-fuchsia-500/10 via-indigo-500/10 to-cyan-500/10 text-indigo-500 dark:text-indigo-300">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-5 w-5">
                  {it.icon}
                </svg>
              </span>
              <h3 className="mt-4 text-lg font-semibold">{it.title}</h3>
              <p
                className="mt-2 text-sm text-stone-600 dark:text-stone-400"
                dangerouslySetInnerHTML={{ __html: it.body }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { n: "01", t: "Upload a photo", b: "Drag in a JPEG, PNG, or WebP. We detect every face on the spot." },
    { n: "02", t: "Label one face", b: "Click a bounding box, type a name. WhosePic remembers." },
    { n: "03", t: "Search by person", b: "Pull up every photo that person appears in &mdash; even the ones you forgot about." },
  ];
  return (
    <section className="border-y border-stone-200/70 bg-white/60 px-4 py-24 backdrop-blur-sm dark:border-stone-800 dark:bg-stone-900/40">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">How it works</h2>
        <div className="mt-12 grid gap-8 sm:grid-cols-3">
          {steps.map((s) => (
            <div key={s.n} className="relative">
              <span className="numeral-outline text-5xl font-bold text-transparent">
                {s.n}
              </span>
              <h3 className="mt-3 text-lg font-semibold">{s.t}</h3>
              <p
                className="mt-2 text-sm text-stone-600 dark:text-stone-400"
                dangerouslySetInnerHTML={{ __html: s.b }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Privacy() {
  return (
    <section className="px-4 py-24">
      <div className="mx-auto max-w-3xl rounded-2xl border border-stone-200 bg-gradient-to-br from-white to-stone-50 p-8 dark:border-stone-800 dark:from-stone-900 dark:to-stone-950 sm:p-12">
        <div className="flex items-start gap-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
              <path
                d="M12 3 4 6v6c0 4.5 3.4 8.4 8 9 4.6-.6 8-4.5 8-9V6l-8-3Z"
                strokeLinejoin="round"
              />
              <path d="m9 12 2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <div>
            <h2 className="text-xl font-semibold">Your faces. Your photos. Your account.</h2>
            <p className="mt-3 text-sm text-stone-600 dark:text-stone-400">
              Face embeddings are biometric data, so we treat them carefully. Your photos and labels are isolated to
              your account &mdash; nothing is shared, indexed, or shown to anyone else. The image bucket is private and
              served only via short-lived signed URLs.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="px-4 pb-24">
      <div className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-fuchsia-600 to-rose-500 px-6 py-16 text-center text-white shadow-xl">
        <div
          aria-hidden
          className="absolute -inset-x-20 -top-32 h-64 rounded-full bg-white/10 blur-3xl"
        />
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Stop scrolling. Start finding.</h2>
        <p className="mx-auto mt-3 max-w-md text-white/80">
          Make your photo library searchable in minutes.
        </p>
        <Link
          href="/login?next=/gallery"
          className="mt-8 inline-flex h-12 items-center justify-center rounded-full bg-white px-8 text-sm font-semibold text-stone-900 transition hover:bg-stone-100"
        >
          Create your account
        </Link>
      </div>
      <p className="mt-8 text-center text-xs text-stone-500">
        WhosePic &middot; built with FastAPI, Next.js, Neon, and Azure Blob Storage.
      </p>
    </section>
  );
}
