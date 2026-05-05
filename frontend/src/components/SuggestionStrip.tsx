"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import type { Face, LabelSuggestion } from "@/lib/types";

type Props = {
  face: Face;
  onAssigned: (face: Face) => void;
};

export function SuggestionStrip({ face, onAssigned }: Props) {
  const [suggestions, setSuggestions] = useState<LabelSuggestion[] | null>(null);

  useEffect(() => {
    if (face.label_id) {
      setSuggestions(null);
      return;
    }
    let cancelled = false;
    apiFetch<LabelSuggestion[]>(`/faces/${face.id}/suggestions?k=3`)
      .then((rows) => !cancelled && setSuggestions(rows))
      .catch(() => !cancelled && setSuggestions([]));
    return () => {
      cancelled = true;
    };
  }, [face.id, face.label_id]);

  if (face.label_id || !suggestions || suggestions.length === 0) return null;

  async function accept(s: LabelSuggestion) {
    const updated = await apiFetch<Face>(`/faces/${face.id}/label`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label_id: s.label_id }),
    });
    onAssigned({ ...updated, label_name: s.name });
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded border border-amber-300 bg-amber-50 p-2 text-sm dark:border-amber-700 dark:bg-amber-950">
      <span className="text-stone-700 dark:text-stone-300">Suggestion:</span>
      {suggestions.map((s) => (
        <button
          key={s.label_id}
          onClick={() => accept(s)}
          className="rounded bg-amber-200 px-2 py-1 text-xs hover:bg-amber-300 dark:bg-amber-800 dark:hover:bg-amber-700"
          title={`similarity ${s.score.toFixed(2)}`}
        >
          {s.name} ({s.score.toFixed(2)})
        </button>
      ))}
    </div>
  );
}
