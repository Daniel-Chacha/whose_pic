"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiUpload } from "@/lib/api";
import type { ImageWithFaces } from "@/lib/types";

export function Uploader() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handle(file: File) {
    setError(null);
    setBusy(true);
    try {
      const res = await apiUpload<ImageWithFaces>("/images", file);
      router.push(`/image/${res.id}`);
    } catch (e: any) {
      setError(e?.message ?? "upload failed");
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      <label className="flex h-48 cursor-pointer flex-col items-center justify-center rounded border-2 border-dashed border-stone-300 text-sm text-stone-500 hover:border-stone-400 dark:border-stone-700">
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          disabled={busy}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handle(f);
          }}
        />
        {busy ? "Uploading & detecting…" : "Click to choose a photo"}
      </label>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
