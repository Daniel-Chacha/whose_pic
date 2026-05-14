"use client";

import { Logo } from "@/components/Logo";

export type UploadState = {
  phase: "idle" | "uploading" | "detecting";
  done: number;
  total: number;
};

export function UploadOverlay({ state }: { state: UploadState }) {
  if (state.phase === "idle") return null;

  const uploading = state.phase === "uploading";
  const pct = state.total
    ? Math.round((state.done / state.total) * 100)
    : 0;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-white/90 p-6 backdrop-blur-md">
      <div className="w-full max-w-sm rounded-2xl border border-neutral-100 bg-white p-8 text-center shadow-2xl">
        <div className="relative mx-auto h-20 w-20">
          <svg
            viewBox="0 0 50 50"
            className="h-20 w-20 animate-spin"
            style={{ animationDuration: "1.4s" }}
          >
            <defs>
              <linearGradient id="upload-spin" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#7C2DFF" />
                <stop offset="50%" stopColor="#E0148C" />
                <stop offset="100%" stopColor="#00CC9A" />
              </linearGradient>
            </defs>
            <circle cx="25" cy="25" r="21" fill="none" stroke="#F1EFE8" strokeWidth="5" />
            <circle
              cx="25"
              cy="25"
              r="21"
              fill="none"
              stroke="url(#upload-spin)"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray="80 132"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            {uploading ? (
              <Logo className="h-9 w-9 animate-pulse" />
            ) : (
              <div className="relative h-10 w-10 overflow-hidden rounded-lg">
                <Logo className="h-10 w-10" />
                <span className="absolute inset-x-0 top-0 h-0.5 animate-scan bg-gradient-to-r from-transparent via-primary-600 to-transparent" />
              </div>
            )}
          </div>
        </div>

        <h2 className="mt-5 text-lg font-semibold">
          {uploading ? "Adding your photos…" : "Detecting faces…"}
        </h2>
        <p className="mt-1 text-sm text-neutral-400">
          {uploading
            ? "Reading each photo into this browser. Nothing is uploaded anywhere."
            : "Scanning every photo for faces — this is the slow part, hang tight."}
        </p>

        <div className="mt-5">
          <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary-600 via-magenta-600 to-secondary-600 transition-all duration-300"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="mt-2 text-sm font-semibold text-neutral-900">
            {state.done}{" "}
            <span className="font-normal text-neutral-400">/ {state.total}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
