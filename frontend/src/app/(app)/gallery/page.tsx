"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type InputHTMLAttributes,
} from "react";
import { useSessionStore } from "@/lib/sessionStore";
import { imagesForLabel } from "@/lib/selectors";
import { loadModels } from "@/lib/faceEngine";
import { ImageModal } from "@/components/gallery/ImageModal";
import { PeoplePanel } from "@/components/gallery/PeoplePanel";
import {
  UploadOverlay,
  type UploadState,
} from "@/components/gallery/UploadOverlay";

const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];

// `webkitdirectory` is valid HTML but not in React's input typings yet.
const folderInputProps = {
  webkitdirectory: "",
} as unknown as InputHTMLAttributes<HTMLInputElement>;

export default function GalleryPage() {
  const images = useSessionStore((s) => s.images);
  const faces = useSessionStore((s) => s.faces);
  const labels = useSessionStore((s) => s.labels);
  const objectUrls = useSessionStore((s) => s.objectUrls);
  const addImageBlob = useSessionStore((s) => s.addImageBlob);
  const detectImage = useSessionStore((s) => s.detectImage);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const [upload, setUpload] = useState<UploadState>({
    phase: "idle",
    done: 0,
    total: 0,
  });
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [activeLabelId, setActiveLabelId] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [modalImageId, setModalImageId] = useState<string | null>(null);

  useEffect(() => {
    // Prefetch face-api weights while the user browses.
    loadModels().catch(() => {});
  }, []);

  const visibleImages = useMemo(() => {
    if (activeLabelId) {
      return imagesForLabel({ images, faces, labels }, activeLabelId);
    }
    const q = query.trim().toLowerCase();
    if (!q) return images;
    const matchedLabels = new Set(
      labels.filter((l) => l.name.toLowerCase().includes(q)).map((l) => l.id),
    );
    const matchedImages = new Set(
      faces
        .filter((f) => f.labelId && matchedLabels.has(f.labelId))
        .map((f) => f.imageId),
    );
    return images.filter((i) => matchedImages.has(i.id));
  }, [images, faces, labels, activeLabelId, query]);

  async function handleFiles(fileList: FileList | null) {
    const files = Array.from(fileList ?? []).filter((f) =>
      ACCEPTED.includes(f.type),
    );
    if (files.length === 0) {
      setUploadError("No JPEG, PNG, or WebP images found.");
      return;
    }
    setUploadError(null);
    try {
      // Phase 1: read + store every file (fast — images pop into the grid).
      setUpload({ phase: "uploading", done: 0, total: files.length });
      const prepared: { id: string; file: File }[] = [];
      for (const file of files) {
        const id = await addImageBlob(file);
        prepared.push({ id, file });
        setUpload({
          phase: "uploading",
          done: prepared.length,
          total: files.length,
        });
      }
      // Phase 2: detect faces in each (slow — the real work).
      setUpload({ phase: "detecting", done: 0, total: prepared.length });
      await loadModels();
      let done = 0;
      for (const item of prepared) {
        await detectImage(item.id, item.file);
        done += 1;
        setUpload({ phase: "detecting", done, total: prepared.length });
      }
      setUpload({ phase: "idle", done: 0, total: 0 });
    } catch (e) {
      setUploadError(
        e instanceof Error ? e.message : "Could not process images.",
      );
      setUpload({ phase: "idle", done: 0, total: 0 });
    }
  }

  function clearFilter() {
    setActiveLabelId(null);
    setQuery("");
  }

  const activeName = activeLabelId
    ? (labels.find((l) => l.id === activeLabelId)?.name ?? null)
    : null;
  const filtering = activeLabelId !== null || query.trim() !== "";

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
      <input
        ref={folderInputRef}
        type="file"
        multiple
        {...folderInputProps}
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-900"
        >
          <PlusIcon /> Add photos
        </button>
        <button
          type="button"
          onClick={() => folderInputRef.current?.click()}
          className="rounded-lg border border-neutral-100 bg-white px-3 py-2 text-sm font-medium text-neutral-900 transition-colors hover:bg-primary-50"
        >
          Folder
        </button>
        <div className="relative min-w-[11rem] flex-1 sm:max-w-xs">
          <SearchIcon />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveLabelId(null);
            }}
            placeholder="Search people…"
            className="w-full rounded-lg border border-neutral-100 bg-white py-2 pl-9 pr-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-[1.5px] focus:border-primary-400 focus:outline-none"
          />
        </div>
        <button
          type="button"
          onClick={() => setPanelOpen((o) => !o)}
          className={`ml-auto rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
            panelOpen
              ? "border-primary-400 bg-primary-50 text-primary-600"
              : "border-neutral-100 bg-white text-neutral-900 hover:bg-primary-50"
          }`}
        >
          {panelOpen ? "Hide people" : `Labelled people (${labels.length})`}
        </button>
      </div>

      {uploadError && <p className="text-sm text-accent-600">{uploadError}</p>}

      {filtering && (
        <div className="flex items-center gap-2 text-sm text-neutral-400">
          <span>
            {activeLabelId
              ? `Showing ${activeName ?? "person"}`
              : `Search: “${query.trim()}”`}{" "}
            &middot; {visibleImages.length} photo
            {visibleImages.length === 1 ? "" : "s"}
          </span>
          <button
            type="button"
            onClick={clearFilter}
            className="text-primary-600 underline"
          >
            clear
          </button>
        </div>
      )}

      {images.length === 0 ? (
        <EmptyState onAdd={() => fileInputRef.current?.click()} />
      ) : (
        <>
          <p className="flex items-center gap-2 rounded-lg border border-primary-100 bg-primary-50 px-3 py-2 text-sm text-primary-900">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-600 text-xs font-bold text-white">
              i
            </span>
            Click any photo to name the faces in it &mdash; label someone once
            and WhosePic finds them in the rest.
          </p>
          <div className={panelOpen ? "flex flex-col gap-6 md:flex-row" : ""}>
            <div className="min-w-0 flex-1">
              {visibleImages.length === 0 ? (
                <p className="py-10 text-center text-sm text-neutral-400">
                  No photos match.
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                  {visibleImages.map((img) => (
                    <button
                      key={img.id}
                      type="button"
                      onClick={() => setModalImageId(img.id)}
                      className="group relative aspect-square overflow-hidden rounded-xl border border-neutral-100 bg-neutral-100"
                    >
                      {objectUrls[img.id] && (
                        <img
                          src={objectUrls[img.id]}
                          alt=""
                          className="h-full w-full object-cover transition group-hover:scale-105"
                        />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {panelOpen && (
              <PeoplePanel
                activeLabelId={activeLabelId}
                onSelect={(id) => {
                  setActiveLabelId(id);
                  setQuery("");
                }}
                onClose={() => setPanelOpen(false)}
              />
            )}
          </div>
        </>
      )}

      {modalImageId && (
        <ImageModal
          imageId={modalImageId}
          onClose={() => setModalImageId(null)}
        />
      )}
      <UploadOverlay state={upload} />
    </div>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-primary-400 bg-white/70 px-6 py-16 text-center">
      <h2 className="text-lg font-semibold">No photos yet</h2>
      <p className="mt-1 max-w-xs text-sm text-neutral-400">
        Add a photo, a batch, or a whole folder. Everything is processed right
        here in your browser.
      </p>
      <button
        type="button"
        onClick={onAdd}
        className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-900"
      >
        <PlusIcon /> Add photos
      </button>
    </div>
  );
}

function PlusIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      className="h-4 w-4"
    >
      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" strokeLinecap="round" />
    </svg>
  );
}
