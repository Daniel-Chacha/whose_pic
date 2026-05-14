// Client-side face matching over 128-d face-api descriptors.
// Replaces the server's pgvector cosine search.

// face-api descriptors compare by euclidean distance; 0.6 is the well-known
// same/different boundary. 0.55 is slightly stricter to favour precision.
export const MATCH_THRESHOLD = 0.55;

export function euclidean(a: number[], b: number[]): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const d = a[i] - b[i];
    sum += d * d;
  }
  return Math.sqrt(sum);
}

// Map a distance into a 0..1 display score (1 = identical).
export function distanceToScore(distance: number): number {
  return Math.max(0, Math.min(1, 1 - distance / MATCH_THRESHOLD));
}
