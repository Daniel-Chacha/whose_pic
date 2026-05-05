"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import type { Label } from "@/lib/types";

export default function PeoplePage() {
  const [labels, setLabels] = useState<Label[] | null>(null);

  useEffect(() => {
    apiFetch<Label[]>("/labels").then(setLabels);
  }, []);

  if (!labels) return <p className="text-sm text-stone-500">Loading…</p>;
  if (labels.length === 0) {
    return <p className="text-sm text-stone-500">No people yet — label some faces to start.</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
      {labels.map((l) => (
        <Link key={l.id} href={`/people/${l.id}`} className="space-y-2 text-center">
          <div className="aspect-square overflow-hidden rounded-full bg-stone-200 dark:bg-stone-900">
            {l.cover_url && <img src={l.cover_url} alt="" className="h-full w-full object-cover" />}
          </div>
          <div>
            <div className="text-sm font-medium">{l.name}</div>
            <div className="text-xs text-stone-500">{l.face_count} photo{l.face_count === 1 ? "" : "s"}</div>
          </div>
        </Link>
      ))}
    </div>
  );
}
