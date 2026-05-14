"use client";

import { useMemo } from "react";
import { useSessionStore } from "@/lib/sessionStore";
import { labelsWithCounts } from "@/lib/selectors";

type Props = {
  activeLabelId: string | null;
  onSelect: (id: string | null) => void;
  onClose: () => void;
};

export function PeoplePanel({ activeLabelId, onSelect, onClose }: Props) {
  const images = useSessionStore((s) => s.images);
  const faces = useSessionStore((s) => s.faces);
  const labels = useSessionStore((s) => s.labels);
  const objectUrls = useSessionStore((s) => s.objectUrls);

  const people = useMemo(
    () => labelsWithCounts({ images, faces, labels }),
    [images, faces, labels],
  );

  return (
    <aside className="w-full shrink-0 self-start rounded-xl border border-neutral-100 bg-white/85 p-3 backdrop-blur-sm md:w-64">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="font-sans text-sm font-semibold text-neutral-900">
          Labelled people
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="text-xs text-neutral-400 transition-colors hover:text-primary-600"
        >
          hide
        </button>
      </div>

      <button
        type="button"
        onClick={() => onSelect(null)}
        className={`mb-1 block w-full rounded-lg px-2 py-1.5 text-left text-sm transition-colors ${
          activeLabelId === null
            ? "bg-primary-50 font-medium text-primary-600"
            : "text-neutral-900 hover:bg-primary-50"
        }`}
      >
        All photos
      </button>

      {people.length === 0 ? (
        <p className="px-2 py-3 text-xs text-neutral-400">
          No one labelled yet. Click a photo and name a face to start.
        </p>
      ) : (
        <ul className="space-y-0.5">
          {people.map((p) => {
            const cover = p.coverImageId ? objectUrls[p.coverImageId] : undefined;
            const active = p.id === activeLabelId;
            return (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => onSelect(p.id)}
                  className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors ${
                    active ? "bg-primary-50" : "hover:bg-primary-50"
                  }`}
                >
                  <span className="h-8 w-8 shrink-0 overflow-hidden rounded-full border border-neutral-100 bg-neutral-100">
                    {cover && (
                      <img src={cover} alt="" className="h-full w-full object-cover" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span
                      className={`block truncate text-sm ${
                        active ? "font-medium text-primary-600" : "text-neutral-900"
                      }`}
                    >
                      {p.name}
                    </span>
                    <span className="block text-xs text-neutral-400">
                      {p.faceCount} photo{p.faceCount === 1 ? "" : "s"}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </aside>
  );
}
