"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import type { Face, Label } from "@/lib/types";

type Props = {
  face: Face;
  labels: Label[];
  onAssigned: (face: Face) => void;
};

export function LabelPicker({ face, labels, onAssigned }: Props) {
  const [query, setQuery] = useState(face.label_name ?? "");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setQuery(face.label_name ?? "");
  }, [face.id, face.label_name]);

  const matches = labels.filter((l) =>
    l.name.toLowerCase().includes(query.toLowerCase()),
  );
  const exact = labels.find((l) => l.name.toLowerCase() === query.trim().toLowerCase());

  async function pick(label_id: string | null, name: string | null) {
    setBusy(true);
    const updated = await apiFetch<Face>(`/faces/${face.id}/label`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(label_id ? { label_id } : { name }),
    });
    setBusy(false);
    onAssigned({
      ...updated,
      label_name: name ?? labels.find((l) => l.id === label_id)?.name ?? null,
    });
  }

  async function clear() {
    setBusy(true);
    const updated = await apiFetch<Face>(`/faces/${face.id}/label`, { method: "DELETE" });
    setBusy(false);
    onAssigned({ ...updated, label_name: null });
  }

  return (
    <div className="space-y-2">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Type a name…"
        disabled={busy}
        className="w-full rounded border border-stone-300 bg-transparent px-3 py-2 text-sm dark:border-stone-700"
      />
      <ul className="max-h-48 overflow-auto rounded border border-stone-200 dark:border-stone-800">
        {matches.map((l) => (
          <li key={l.id}>
            <button
              onClick={() => pick(l.id, null)}
              disabled={busy}
              className="block w-full px-3 py-2 text-left text-sm hover:bg-stone-100 dark:hover:bg-stone-800"
            >
              {l.name} <span className="text-stone-500">({l.face_count})</span>
            </button>
          </li>
        ))}
        {query.trim() && !exact && (
          <li>
            <button
              onClick={() => pick(null, query.trim())}
              disabled={busy}
              className="block w-full px-3 py-2 text-left text-sm font-medium text-blue-600 hover:bg-stone-100 dark:hover:bg-stone-800"
            >
              + Create "{query.trim()}"
            </button>
          </li>
        )}
      </ul>
      {face.label_id && (
        <button onClick={clear} disabled={busy} className="text-xs text-red-600 underline">
          Clear label
        </button>
      )}
    </div>
  );
}
