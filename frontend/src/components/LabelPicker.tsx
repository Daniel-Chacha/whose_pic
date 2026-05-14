"use client";

import { useEffect, useState } from "react";
import { useSessionStore } from "@/lib/sessionStore";
import type { FaceView, LabelWithCount } from "@/lib/types";

type Props = {
  face: FaceView;
  labels: LabelWithCount[];
};

export function LabelPicker({ face, labels }: Props) {
  const assignLabel = useSessionStore((s) => s.assignLabel);
  const assignLabelByName = useSessionStore((s) => s.assignLabelByName);
  const clearLabel = useSessionStore((s) => s.clearLabel);

  const [query, setQuery] = useState(face.labelName ?? "");

  useEffect(() => {
    setQuery(face.labelName ?? "");
  }, [face.id, face.labelName]);

  const matches = labels.filter((l) =>
    l.name.toLowerCase().includes(query.toLowerCase()),
  );
  const exact = labels.find(
    (l) => l.name.toLowerCase() === query.trim().toLowerCase(),
  );

  return (
    <div className="space-y-2">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Type a name…"
        className="w-full rounded-lg border border-neutral-100 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-[1.5px] focus:border-primary-400 focus:outline-none"
      />
      <ul className="max-h-48 overflow-auto rounded-lg border border-neutral-100">
        {matches.map((l) => (
          <li key={l.id}>
            <button
              type="button"
              onClick={() => assignLabel(face.id, l.id)}
              className="block w-full px-3 py-2 text-left text-sm text-neutral-900 transition-colors hover:bg-primary-50"
            >
              {l.name} <span className="text-neutral-400">({l.faceCount})</span>
            </button>
          </li>
        ))}
        {query.trim() && !exact && (
          <li>
            <button
              type="button"
              onClick={() => assignLabelByName(face.id, query.trim())}
              className="block w-full px-3 py-2 text-left text-sm font-medium text-primary-600 transition-colors hover:bg-primary-50"
            >
              + Create &quot;{query.trim()}&quot;
            </button>
          </li>
        )}
      </ul>
      {face.labelId && (
        <button
          type="button"
          onClick={() => clearLabel(face.id)}
          className="text-xs text-red-600 underline"
        >
          Clear label
        </button>
      )}
    </div>
  );
}
