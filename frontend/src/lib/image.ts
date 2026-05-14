"use client";

// Image bytes never leave the device. We keep the original file as the stored
// Blob (IndexedDB has the capacity for it) and build a downscaled canvas only
// as transient detection input — face-api doesn't need full resolution and a
// huge image is slow. Normalized bboxes map back onto any display size.

const MAX_DETECTION_EDGE = 1024;

export type PreparedImage = { blob: Blob; width: number; height: number };

export async function prepareImage(file: File): Promise<PreparedImage> {
  const bitmap = await createImageBitmap(file);
  const width = bitmap.width;
  const height = bitmap.height;
  bitmap.close();
  return { blob: file, width, height };
}

export async function detectionInput(blob: Blob): Promise<HTMLCanvasElement> {
  const bitmap = await createImageBitmap(blob);
  const scale = Math.min(1, MAX_DETECTION_EDGE / Math.max(bitmap.width, bitmap.height));
  const w = Math.max(1, Math.round(bitmap.width * scale));
  const h = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    throw new Error("could not get a 2d canvas context");
  }
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();
  return canvas;
}
