"use client";

import { useEffect, useState, type ReactNode } from "react";
import { bootSession, useSessionStore } from "@/lib/sessionStore";

export function SessionGate({ children }: { children: ReactNode }) {
  const hydrated = useSessionStore((s) => s.hydrated);
  const persistError = useSessionStore((s) => s.persistError);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    bootSession().catch((e) =>
      setError(e instanceof Error ? e.message : "failed to start session"),
    );
  }, []);

  if (error) {
    return (
      <p className="py-20 text-center text-sm text-accent-600">{error}</p>
    );
  }
  if (!hydrated) {
    return (
      <p className="py-20 text-center text-sm text-neutral-400">Loading…</p>
    );
  }

  return (
    <>
      {persistError && (
        <div className="mb-4 rounded-lg border border-accent-400 bg-accent-50 px-3 py-2 text-xs text-accent-900">
          Storage is full — newer photos won&apos;t survive a refresh. Delete some
          photos to free space.
        </div>
      )}
      {children}
    </>
  );
}
