"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { BBoxOverlay } from "@/components/BBoxOverlay";
import { LabelPicker } from "@/components/LabelPicker";
import { SuggestionStrip } from "@/components/SuggestionStrip";
import type { Face, ImageWithFaces, Label } from "@/lib/types";

export default function ImagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [image, setImage] = useState<ImageWithFaces | null>(null);
  const [labels, setLabels] = useState<Label[]>([]);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<ImageWithFaces>(`/images/${id}`).then((img) => {
      setImage(img);
      setSelected(img.faces[0]?.id ?? null);
    });
    apiFetch<Label[]>("/labels").then(setLabels);
  }, [id]);

  function updateFace(updated: Face) {
    setImage((img) =>
      img ? { ...img, faces: img.faces.map((f) => (f.id === updated.id ? { ...f, ...updated } : f)) } : img,
    );
    apiFetch<Label[]>("/labels").then(setLabels);
  }

  async function onDelete() {
    if (!confirm("Delete this photo?")) return;
    await apiFetch(`/images/${id}`, { method: "DELETE" });
    router.push("/");
  }

  if (!image) return <p className="text-sm text-stone-500">Loading…</p>;

  const selectedFace = image.faces.find((f) => f.id === selected) ?? null;

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_320px]">
      <div className="space-y-3">
        {image.signed_url && (
          <BBoxOverlay
            src={image.signed_url}
            faces={image.faces}
            selectedFaceId={selected}
            onSelect={setSelected}
          />
        )}
        <button onClick={onDelete} className="text-xs text-red-600 underline">Delete photo</button>
      </div>
      <aside className="space-y-4">
        {image.faces.length === 0 && (
          <p className="text-sm text-stone-500">No faces detected.</p>
        )}
        {selectedFace && (
          <>
            <SuggestionStrip face={selectedFace} onAssigned={updateFace} />
            <div className="rounded border border-stone-200 p-3 dark:border-stone-800">
              <h3 className="mb-2 text-sm font-medium">
                {selectedFace.label_name ? `Labelled: ${selectedFace.label_name}` : "Label this face"}
              </h3>
              <LabelPicker face={selectedFace} labels={labels} onAssigned={updateFace} />
            </div>
          </>
        )}
        <div className="text-xs text-stone-500">
          {image.faces.length} face{image.faces.length === 1 ? "" : "s"} · click a box to switch.
        </div>
      </aside>
    </div>
  );
}
