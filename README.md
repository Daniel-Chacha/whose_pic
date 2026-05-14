# WhosePic

Add photos, label faces once, and find every picture a person appears in —
entirely in your browser.

WhosePic is a fully client-side face-recognition photo album. There is no
backend, no database, and no account. Face detection and recognition run
in-browser via [`@vladmandic/face-api`](https://github.com/vladmandic/face-api),
and your photos never leave your device.

## How it works

- **Detection + recognition** run in the browser. A photo is decoded to a
  canvas, faces are detected, and each face gets a 128-d descriptor.
- **State** lives in a [Zustand](https://github.com/pmndrs/zustand) store. It is
  persisted to **IndexedDB** so a page refresh keeps your session.
- **Lifecycle** — a per-tab `sessionStorage` marker means that opening the site
  fresh (after the tab was closed) wipes any leftover IndexedDB data before the
  app starts. So a refresh keeps your work; closing the site discards it.
- **Matching** — "tag once, find everywhere" is euclidean-distance search over
  the 128-d descriptors, done client-side (replacing what used to be a pgvector
  query).

Nothing is uploaded. Nothing is stored on a server.

## Stack

- **Next.js 16** (App Router, TypeScript) + Tailwind
- **@vladmandic/face-api** (TensorFlow.js) for in-browser detection + recognition
- **Zustand** + **idb-keyval** for state and IndexedDB persistence

## Layout

- [frontend/](frontend/) — the entire app
  - `src/lib/faceEngine.ts` — face-api wrapper (the only module that touches it)
  - `src/lib/sessionStore.ts` — Zustand store + IndexedDB persistence + boot logic
  - `src/lib/selectors.ts` — client-side matching / derived data
  - `src/components/SessionGate.tsx` — runs boot, gates the app until hydrated
  - `public/models/` — face-api model weights (committed; ~12 MB)

## Run

```sh
cd frontend
npm install
npm run dev
```

Open <http://localhost:3000>.

The face-api model weights in `frontend/public/models/` are committed to the
repo, so there is nothing else to download or configure.

## Smoke test

1. Go to `/upload` and add a clear multi-face photo — faces are detected and you
   land on `/image/{id}` with bounding boxes.
2. Click a box and label the face (type a new name to create it).
3. Add another photo of the same person — select that face; a "Suggestion" strip
   proposes the existing label. Click to confirm.
4. `/people` lists labelled people; `/people/{id}` has "Labelled" and
   "Suggested" tabs.
5. Refresh the page — everything is still there (rehydrated from IndexedDB).
6. Close the tab and reopen the site — the session is gone.

## Notes

- **Capacity** — IndexedDB is large, but if a write hits the quota a banner
  appears and the app keeps running in-memory for the rest of the session.
- **Accuracy** — the in-browser 128-d recognizer is lighter than a server-side
  ArcFace model; suggestions are best on clear, front-facing photos and are
  always confirmed by one click rather than applied automatically.
