// Pure derived-data helpers over the session snapshot. Kept out of the Zustand
// store so components can subscribe to the raw arrays and recompute with
// useMemo — a function living on the store would never trigger a re-render.

import type {
  ImageMeta,
  StoredFace,
  StoredLabel,
  ImageWithFaces,
  LabelWithCount,
  Suggestion,
} from "./types";
import { euclidean, distanceToScore, MATCH_THRESHOLD } from "./match";

export type Snapshot = {
  images: ImageMeta[];
  faces: StoredFace[];
  labels: StoredLabel[];
};

export function imageWithFaces(s: Snapshot, id: string): ImageWithFaces | null {
  const image = s.images.find((i) => i.id === id);
  if (!image) return null;
  const nameOf = (lid: string | null) =>
    lid ? s.labels.find((l) => l.id === lid)?.name ?? null : null;
  const faces = s.faces
    .filter((f) => f.imageId === id)
    .map((f) => ({ ...f, labelName: nameOf(f.labelId) }));
  return { image, faces };
}

export function labelsWithCounts(s: Snapshot): LabelWithCount[] {
  return s.labels.map((l) => {
    const labelFaces = s.faces.filter((f) => f.labelId === l.id);
    let coverImageId: string | null = null;
    let newest = -1;
    for (const f of labelFaces) {
      const img = s.images.find((i) => i.id === f.imageId);
      if (img && img.createdAt > newest) {
        newest = img.createdAt;
        coverImageId = img.id;
      }
    }
    return { id: l.id, name: l.name, faceCount: labelFaces.length, coverImageId };
  });
}

export function imagesForLabel(s: Snapshot, labelId: string): ImageMeta[] {
  const imageIds = new Set(
    s.faces.filter((f) => f.labelId === labelId).map((f) => f.imageId),
  );
  return s.images.filter((i) => imageIds.has(i.id));
}

export function suggestionsForFace(
  s: Snapshot,
  faceId: string,
  k = 3,
): Suggestion[] {
  const target = s.faces.find((f) => f.id === faceId);
  if (!target) return [];
  const best = new Map<string, { distance: number; sampleFaceId: string }>();
  for (const f of s.faces) {
    if (f.id === faceId || !f.labelId) continue;
    const distance = euclidean(target.descriptor, f.descriptor);
    if (distance >= MATCH_THRESHOLD) continue;
    const prev = best.get(f.labelId);
    if (!prev || distance < prev.distance) {
      best.set(f.labelId, { distance, sampleFaceId: f.id });
    }
  }
  return [...best.entries()]
    .sort((a, b) => a[1].distance - b[1].distance)
    .slice(0, k)
    .map(([labelId, { distance, sampleFaceId }]) => ({
      labelId,
      name: s.labels.find((l) => l.id === labelId)?.name ?? "",
      score: distanceToScore(distance),
      sampleFaceId,
    }));
}
