"use client";

import { useMemo } from "react";
import { useSessionStore } from "@/lib/sessionStore";
import { suggestionsForFace } from "@/lib/selectors";
import type { FaceView } from "@/lib/types";

type Props = {
  face: FaceView;
};

export function SuggestionStrip({ face }: Props) {
  const images = useSessionStore((s) => s.images);
  const faces = useSessionStore((s) => s.faces);
  const labels = useSessionStore((s) => s.labels);
  const assignLabel = useSessionStore((s) => s.assignLabel);

  const suggestions = useMemo(() => {
    if (face.labelId) return [];
    return suggestionsForFace({ images, faces, labels }, face.id, 3);
  }, [images, faces, labels, face.id, face.labelId]);

  if (face.labelId || suggestions.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-accent-400 bg-accent-50 p-2 text-sm">
      <span className="text-accent-900">Suggestion:</span>
      {suggestions.map((s) => (
        <button
          key={s.labelId}
          type="button"
          onClick={() => assignLabel(face.id, s.labelId)}
          className="rounded-md border border-accent-400 bg-white px-2 py-1 text-xs font-medium text-accent-900 transition-colors hover:bg-accent-50"
          title={`similarity ${s.score.toFixed(2)}`}
        >
          {s.name} ({s.score.toFixed(2)})
        </button>
      ))}
    </div>
  );
}
