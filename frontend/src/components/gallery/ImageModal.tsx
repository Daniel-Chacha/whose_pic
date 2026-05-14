"use client";

import { useMemo, useState } from "react";
import { useSessionStore } from "@/lib/sessionStore";
import { imageWithFaces, labelsWithCounts } from "@/lib/selectors";
import { Modal } from "@/components/Modal";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { BBoxOverlay } from "@/components/BBoxOverlay";
import { LabelPicker } from "@/components/LabelPicker";
import { SuggestionStrip } from "@/components/SuggestionStrip";

type Props = {
  imageId: string;
  onClose: () => void;
};

export function ImageModal({ imageId, onClose }: Props) {
  const images = useSessionStore((s) => s.images);
  const faces = useSessionStore((s) => s.faces);
  const labels = useSessionStore((s) => s.labels);
  const objectUrls = useSessionStore((s) => s.objectUrls);
  const deleteImage = useSessionStore((s) => s.deleteImage);

  const view = useMemo(
    () => imageWithFaces({ images, faces, labels }, imageId),
    [images, faces, labels, imageId],
  );
  const labelsWithCount = useMemo(
    () => labelsWithCounts({ images, faces, labels }),
    [images, faces, labels],
  );

  const [selected, setSelected] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!view) {
    return (
      <Modal onClose={onClose} className="max-w-md">
        <p className="p-8 text-sm text-neutral-400">Photo not found.</p>
      </Modal>
    );
  }

  const url = objectUrls[imageId];
  const selectedId = selected ?? view.faces[0]?.id ?? null;
  const selectedFace = view.faces.find((f) => f.id === selectedId) ?? null;

  return (
    <Modal onClose={onClose} className="max-w-4xl">
      <div className="grid gap-6 p-5 md:grid-cols-[1fr_300px]">
        <div className="space-y-3">
          {url && (
            <BBoxOverlay
              src={url}
              faces={view.faces}
              selectedFaceId={selectedId}
              onSelect={setSelected}
            />
          )}
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="text-xs text-red-600 underline"
          >
            Delete photo
          </button>
        </div>
        <aside className="space-y-4">
          {view.faces.length === 0 ? (
            <p className="text-sm text-neutral-400">
              No faces detected in this photo.
            </p>
          ) : (
            <p className="text-xs text-neutral-400">
              {view.faces.length} face{view.faces.length === 1 ? "" : "s"} found
              &mdash; click a box to pick one, then give it a name.
            </p>
          )}
          {selectedFace && (
            <>
              <SuggestionStrip face={selectedFace} />
              <div className="rounded-xl border border-neutral-100 bg-white/85 p-3">
                <h3 className="mb-2 font-sans text-sm font-medium text-neutral-900">
                  {selectedFace.labelName
                    ? `Labelled: ${selectedFace.labelName}`
                    : "Name this face"}
                </h3>
                <LabelPicker face={selectedFace} labels={labelsWithCount} />
              </div>
            </>
          )}
        </aside>
      </div>
      {confirmDelete && (
        <ConfirmDialog
          title="Delete this photo?"
          message="This photo and its detected faces will be removed from the session."
          confirmLabel="Delete"
          destructive
          onCancel={() => setConfirmDelete(false)}
          onConfirm={() => {
            deleteImage(imageId);
            onClose();
          }}
        />
      )}
    </Modal>
  );
}
