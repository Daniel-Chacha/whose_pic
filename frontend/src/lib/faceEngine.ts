"use client";

// The ONLY module that touches @vladmandic/face-api. It pulls in TensorFlow.js
// which references `window` at module-eval time, so it must never be statically
// imported into anything reachable by SSR — we load it via dynamic import()
// inside functions, and these functions are only ever called from effects /
// event handlers on the client.

import type * as FaceApi from "@vladmandic/face-api";

export type RawDetectedFace = {
  bbox: { x: number; y: number; w: number; h: number }; // normalized [0,1]
  detScore: number;
  descriptor: number[]; // 128-d
};

const MODEL_URL = "/models";

let faceapiNs: typeof FaceApi | null = null;
let modelsPromise: Promise<void> | null = null;

async function getFaceApi(): Promise<typeof FaceApi> {
  if (!faceapiNs) {
    faceapiNs = await import("@vladmandic/face-api");
  }
  return faceapiNs;
}

export function loadModels(): Promise<void> {
  if (!modelsPromise) {
    modelsPromise = (async () => {
      const faceapi = await getFaceApi();
      await Promise.all([
        faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      ]);
    })().catch((e) => {
      modelsPromise = null; // allow a later retry
      throw e;
    });
  }
  return modelsPromise;
}

export async function detectFaces(
  input: HTMLCanvasElement | HTMLImageElement,
): Promise<RawDetectedFace[]> {
  const faceapi = await getFaceApi();
  await loadModels();

  const results = await faceapi
    .detectAllFaces(input, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }))
    .withFaceLandmarks()
    .withFaceDescriptors();

  const w = input instanceof HTMLImageElement ? input.naturalWidth : input.width;
  const h = input instanceof HTMLImageElement ? input.naturalHeight : input.height;

  return results.map((r) => {
    const box = r.detection.box;
    return {
      bbox: {
        x: Math.max(0, box.x / w),
        y: Math.max(0, box.y / h),
        w: Math.max(0, box.width / w),
        h: Math.max(0, box.height / h),
      },
      detScore: r.detection.score,
      descriptor: Array.from(r.descriptor),
    };
  });
}
