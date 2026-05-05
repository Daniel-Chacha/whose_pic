"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import type { ImageRow } from "@/lib/types";

export default function GalleryPage() {
  const [images, setImages] = useState<ImageRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<ImageRow[]>("/images")
      .then(setImages)
      .catch((e) => setError(e?.message ?? "failed to load"));
  }, []);

  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (!images) return <p className="text-sm text-stone-500">Loading…</p>;
  if (images.length === 0) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-stone-500">No images yet.</p>
        <Link href="/upload" className="rounded bg-stone-900 px-3 py-2 text-sm text-white dark:bg-stone-100 dark:text-stone-900">
          Upload your first photo
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
      {images.map((img) => (
        <Link key={img.id} href={`/image/${img.id}`} className="group relative aspect-square overflow-hidden rounded bg-stone-200 dark:bg-stone-900">
          {img.signed_url && (
            <img
              src={img.signed_url}
              alt=""
              className="h-full w-full object-cover transition group-hover:opacity-90"
            />
          )}
        </Link>
      ))}
    </div>
  );
}
