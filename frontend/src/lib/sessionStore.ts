"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { StateStorage } from "zustand/middleware";
import {
  get as idbGet,
  set as idbSet,
  del as idbDel,
  clear as idbClear,
  createStore,
} from "idb-keyval";

import type { ImageMeta, StoredFace, StoredLabel } from "./types";
import { loadModels, detectFaces } from "./faceEngine";
import { prepareImage, detectionInput } from "./image";

// Two separate IndexedDB databases: one holds image Blobs keyed by image id,
// the other holds the persisted metadata JSON written by zustand's `persist`.
const blobStore = createStore("whosepic-blobs", "blobs");
const metaStore = createStore("whosepic-meta", "meta");

const SESSION_MARKER = "whosepic:session";

const idbMetaStorage: StateStorage = {
  getItem: async (name) => (await idbGet<string>(name, metaStore)) ?? null,
  setItem: async (name, value) => {
    await idbSet(name, value, metaStore);
  },
  removeItem: async (name) => {
    await idbDel(name, metaStore);
  },
};

const uuid = () => crypto.randomUUID();

type SessionState = {
  images: ImageMeta[];
  faces: StoredFace[];
  labels: StoredLabel[];

  // runtime-only (never persisted)
  objectUrls: Record<string, string>;
  hydrated: boolean;
  modelsReady: boolean;
  persistError: boolean;

  addImageBlob: (file: File) => Promise<string>;
  detectImage: (id: string, source: Blob) => Promise<void>;
  deleteImage: (id: string) => void;
  createLabel: (name: string) => string;
  assignLabel: (faceId: string, labelId: string) => void;
  assignLabelByName: (faceId: string, name: string) => void;
  clearLabel: (faceId: string) => void;
  renameLabel: (labelId: string, name: string) => void;
  deleteLabel: (labelId: string) => void;
  clearSession: () => Promise<void>;
};

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      images: [],
      faces: [],
      labels: [],
      objectUrls: {},
      hydrated: false,
      modelsReady: false,
      persistError: false,

      // Phase 1 of an "upload": decode the file, persist the blob, and add the
      // image to the gallery immediately (no faces yet).
      addImageBlob: async (file) => {
        const { blob, width, height } = await prepareImage(file);
        const id = uuid();

        try {
          await idbSet(id, blob, blobStore);
        } catch (e) {
          if ((e as DOMException)?.name === "QuotaExceededError") {
            set({ persistError: true });
          } else {
            throw e;
          }
        }

        const url = URL.createObjectURL(blob);
        const meta: ImageMeta = { id, width, height, createdAt: Date.now() };
        set((s) => ({
          images: [meta, ...s.images],
          objectUrls: { ...s.objectUrls, [id]: url },
        }));
        return id;
      },

      // Phase 2: run face detection on an already-added image. `source` is the
      // original File the caller still holds, so this works even if the blob
      // couldn't be persisted (quota).
      detectImage: async (id, source) => {
        await loadModels();
        set({ modelsReady: true });

        const canvas = await detectionInput(source);
        const detected = await detectFaces(canvas);

        const newFaces: StoredFace[] = detected.map((d) => ({
          id: uuid(),
          imageId: id,
          bbox: d.bbox,
          detScore: d.detScore,
          descriptor: d.descriptor,
          labelId: null,
        }));
        set((s) => ({ faces: [...s.faces, ...newFaces] }));
      },

      deleteImage: (id) => {
        const url = get().objectUrls[id];
        if (url) URL.revokeObjectURL(url);
        void idbDel(id, blobStore).catch(() => {});
        set((s) => {
          const objectUrls = { ...s.objectUrls };
          delete objectUrls[id];
          return {
            images: s.images.filter((i) => i.id !== id),
            faces: s.faces.filter((f) => f.imageId !== id),
            objectUrls,
          };
        });
      },

      createLabel: (name) => {
        const trimmed = name.trim();
        const existing = get().labels.find(
          (l) => l.name.toLowerCase() === trimmed.toLowerCase(),
        );
        if (existing) return existing.id;
        const id = uuid();
        set((s) => ({
          labels: [...s.labels, { id, name: trimmed, createdAt: Date.now() }],
        }));
        return id;
      },

      assignLabel: (faceId, labelId) => {
        set((s) => ({
          faces: s.faces.map((f) => (f.id === faceId ? { ...f, labelId } : f)),
        }));
      },

      assignLabelByName: (faceId, name) => {
        const labelId = get().createLabel(name);
        get().assignLabel(faceId, labelId);
      },

      clearLabel: (faceId) => {
        set((s) => ({
          faces: s.faces.map((f) => (f.id === faceId ? { ...f, labelId: null } : f)),
        }));
      },

      renameLabel: (labelId, name) => {
        set((s) => ({
          labels: s.labels.map((l) =>
            l.id === labelId ? { ...l, name: name.trim() } : l,
          ),
        }));
      },

      deleteLabel: (labelId) => {
        set((s) => ({
          labels: s.labels.filter((l) => l.id !== labelId),
          faces: s.faces.map((f) =>
            f.labelId === labelId ? { ...f, labelId: null } : f,
          ),
        }));
      },

      clearSession: async () => {
        Object.values(get().objectUrls).forEach((u) => URL.revokeObjectURL(u));
        await Promise.all([
          idbClear(blobStore).catch(() => {}),
          idbClear(metaStore).catch(() => {}),
        ]);
        set({
          images: [],
          faces: [],
          labels: [],
          objectUrls: {},
          persistError: false,
        });
      },
    }),
    {
      name: "whosepic-state",
      storage: createJSONStorage(() => idbMetaStorage),
      skipHydration: true,
      partialize: (s) => ({ images: s.images, faces: s.faces, labels: s.labels }),
    },
  ),
);

async function hydrateBlobs(): Promise<void> {
  const { images } = useSessionStore.getState();
  const objectUrls: Record<string, string> = {};
  for (const img of images) {
    const blob = await idbGet<Blob>(img.id, blobStore);
    if (blob) objectUrls[img.id] = URL.createObjectURL(blob);
  }
  useSessionStore.setState({ objectUrls });
}

let booted = false;

// Runs once on the client. A per-tab sessionStorage marker distinguishes a
// refresh (marker present -> rehydrate from IndexedDB) from a fresh open
// (marker absent -> wipe any leftover data from a previously closed session).
export async function bootSession(): Promise<void> {
  if (booted) return;
  booted = true;

  const hasMarker = window.sessionStorage.getItem(SESSION_MARKER) !== null;

  if (!hasMarker) {
    await Promise.all([
      idbClear(blobStore).catch(() => {}),
      idbClear(metaStore).catch(() => {}),
    ]);
    window.sessionStorage.setItem(SESSION_MARKER, "1");
    useSessionStore.setState({
      images: [],
      faces: [],
      labels: [],
      objectUrls: {},
      hydrated: true,
    });
    return;
  }

  await useSessionStore.persist.rehydrate();
  await hydrateBlobs();
  useSessionStore.setState({ hydrated: true });
}
