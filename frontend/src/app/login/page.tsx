"use client";

import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";

type Mode = "signin" | "signup";

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const params = new URLSearchParams(window.location.search);
    const result = await signIn("credentials", {
      email,
      password,
      action: mode,
      redirect: false,
    });
    setLoading(false);
    if (result?.error) {
      setError(
        mode === "signup"
          ? "Could not create account — that email may already be in use."
          : "Invalid email or password.",
      );
      return;
    }
    window.location.href = params.get("next") ?? "/gallery";
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <BrandPanel />
      <FormPanel
        mode={mode}
        setMode={setMode}
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        error={error}
        loading={loading}
        onSubmit={submit}
      />
    </div>
  );
}

function BrandPanel() {
  return (
    <aside className="relative hidden overflow-hidden bg-gradient-to-br from-rose-100 via-amber-100 to-indigo-100 lg:flex lg:flex-col lg:justify-between dark:from-rose-950/40 dark:via-stone-900 dark:to-indigo-950/60">
      <div
        aria-hidden
        className="absolute -left-24 top-1/3 h-80 w-80 rounded-full bg-fuchsia-300/40 blur-3xl dark:bg-fuchsia-500/20"
      />
      <div
        aria-hidden
        className="absolute -right-16 bottom-10 h-72 w-72 rounded-full bg-cyan-300/40 blur-3xl dark:bg-cyan-500/20"
      />

      <div className="relative z-10 px-12 pt-12">
        <Link href="/" className="text-base font-semibold tracking-tight">
          WhosePic
        </Link>
      </div>

      <div className="relative z-10 px-12 pb-16">
        <h2 className="max-w-md text-balance text-4xl font-bold leading-tight tracking-tight">
          Find every photo of{" "}
          <span className="bg-gradient-to-r from-fuchsia-600 via-indigo-600 to-cyan-600 bg-clip-text text-transparent dark:from-fuchsia-400 dark:via-indigo-400 dark:to-cyan-400">
            anyone
          </span>
          .
        </h2>
        <p className="mt-4 max-w-md text-pretty text-stone-700 dark:text-stone-300">
          Tag a face once, find them in every other picture &mdash; instantly, privately, just for you.
        </p>

        <FacesIllustration />
      </div>
    </aside>
  );
}

function FacesIllustration() {
  return (
    <svg
      viewBox="0 0 480 200"
      className="mt-10 h-auto w-full max-w-md"
      role="img"
      aria-label="Three labelled face thumbnails"
    >
      <defs>
        <linearGradient id="lpA" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fbcfe8" />
          <stop offset="100%" stopColor="#c7d2fe" />
        </linearGradient>
        <linearGradient id="lpB" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="100%" stopColor="#fda4af" />
        </linearGradient>
        <linearGradient id="lpC" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#a7f3d0" />
          <stop offset="100%" stopColor="#a5f3fc" />
        </linearGradient>
      </defs>
      <g>
        <g transform="translate(0,20)">
          <rect x="0" y="0" width="140" height="160" rx="14" fill="url(#lpA)" />
          <circle cx="70" cy="60" r="28" fill="#fff" fillOpacity="0.85" />
          <ellipse cx="70" cy="120" rx="44" ry="34" fill="#fff" fillOpacity="0.85" />
          <rect x="10" y="132" width="60" height="20" rx="10" fill="#fff" fillOpacity="0.95" />
          <text x="40" y="146" fontSize="11" textAnchor="middle" fill="#3730a3" fontFamily="ui-sans-serif, system-ui, sans-serif" fontWeight="600">Alice</text>
        </g>
        <g transform="translate(170,0)">
          <rect x="0" y="0" width="140" height="160" rx="14" fill="url(#lpB)" />
          <circle cx="70" cy="60" r="28" fill="#fff" fillOpacity="0.85" />
          <ellipse cx="70" cy="120" rx="44" ry="34" fill="#fff" fillOpacity="0.85" />
          <rect x="10" y="132" width="60" height="20" rx="10" fill="#fff" fillOpacity="0.95" />
          <text x="40" y="146" fontSize="11" textAnchor="middle" fill="#9d174d" fontFamily="ui-sans-serif, system-ui, sans-serif" fontWeight="600">Mara</text>
        </g>
        <g transform="translate(340,30)">
          <rect x="0" y="0" width="140" height="160" rx="14" fill="url(#lpC)" />
          <circle cx="70" cy="60" r="28" fill="#fff" fillOpacity="0.85" />
          <ellipse cx="70" cy="120" rx="44" ry="34" fill="#fff" fillOpacity="0.85" />
          <rect x="10" y="132" width="60" height="20" rx="10" fill="#fff" fillOpacity="0.95" />
          <text x="40" y="146" fontSize="11" textAnchor="middle" fill="#155e75" fontFamily="ui-sans-serif, system-ui, sans-serif" fontWeight="600">Sam</text>
        </g>
      </g>
    </svg>
  );
}

type FormProps = {
  mode: Mode;
  setMode: (m: Mode) => void;
  email: string;
  setEmail: (s: string) => void;
  password: string;
  setPassword: (s: string) => void;
  error: string | null;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
};

function FormPanel(props: FormProps) {
  const { mode, setMode, email, setEmail, password, setPassword, error, loading, onSubmit } = props;
  const isSignup = mode === "signup";

  return (
    <section className="relative flex min-h-screen items-center justify-center px-6 py-12">
      <Link
        href="/"
        className="absolute left-6 top-6 text-sm text-stone-600 transition hover:text-stone-900 dark:text-stone-400 dark:hover:text-white lg:hidden"
      >
        &larr; WhosePic
      </Link>

      <div className="w-full max-w-sm">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">
            {isSignup ? "Create your account" : "Welcome back"}
          </h1>
          <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
            {isSignup
              ? "Start finding every photo of the people you love."
              : "Sign in to your photo library."}
          </p>
        </div>

        <Tabs mode={mode} setMode={setMode} />

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <Field
            id="email"
            label="Email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={setEmail}
            placeholder="you@example.com"
            autoFocus
          />
          <Field
            id="password"
            label="Password"
            type="password"
            autoComplete={isSignup ? "new-password" : "current-password"}
            required
            minLength={6}
            value={password}
            onChange={setPassword}
            placeholder={isSignup ? "At least 6 characters" : "••••••••"}
            hint={isSignup ? "Use at least 6 characters." : undefined}
          />

          {error && (
            <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-stone-900 text-sm font-medium text-white shadow-sm transition hover:bg-stone-800 disabled:opacity-60 dark:bg-white dark:text-stone-900 dark:hover:bg-stone-100"
          >
            {loading ? <Spinner /> : isSignup ? "Create account" : "Sign in"}
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-stone-500">
          By continuing you agree your photos are stored privately under your account only.
        </p>
      </div>
    </section>
  );
}

function Tabs({ mode, setMode }: { mode: Mode; setMode: (m: Mode) => void }) {
  return (
    <div className="grid grid-cols-2 rounded-lg bg-stone-200/60 p-1 text-sm font-medium dark:bg-stone-800/60">
      {(["signin", "signup"] as const).map((m) => (
        <button
          key={m}
          type="button"
          onClick={() => setMode(m)}
          aria-pressed={mode === m}
          className={`rounded-md px-3 py-2 transition ${
            mode === m
              ? "bg-white text-stone-900 shadow-sm dark:bg-stone-950 dark:text-white"
              : "text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white"
          }`}
        >
          {m === "signin" ? "Sign in" : "Create account"}
        </button>
      ))}
    </div>
  );
}

type FieldProps = {
  id: string;
  label: string;
  type: string;
  required?: boolean;
  minLength?: number;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
  autoFocus?: boolean;
  hint?: string;
};

function Field({ id, label, type, value, onChange, hint, ...rest }: FieldProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-stone-800 dark:text-stone-200">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="block h-11 w-full rounded-lg border border-stone-300 bg-white px-3 text-sm text-stone-900 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
        {...rest}
      />
      {hint && <p className="mt-1 text-xs text-stone-500">{hint}</p>}
    </div>
  );
}

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="4" />
      <path
        d="M4 12a8 8 0 0 1 8-8"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}
