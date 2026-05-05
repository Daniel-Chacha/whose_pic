"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import type { ImageRow, Label, LabelSearchResponse } from "@/lib/types";

type Tab = "labeled" | "suggested";

export default function PersonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [label, setLabel] = useState<Label | null>(null);
  const [tab, setTab] = useState<Tab>("labeled");
  const [data, setData] = useState<LabelSearchResponse | null>(null);

  useEffect(() => {
    apiFetch<Label[]>("/labels").then((rows) => setLabel(rows.find((l) => l.id === id) ?? null));
    apiFetch<LabelSearchResponse>(`/labels/${id}/images?mode=both`).then(setData);
  }, [id]);

  if (!data) return <p className="text-sm text-stone-500">Loading…</p>;

  const rows: ImageRow[] = (tab === "labeled" ? data.labeled : data.suggested) ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-baseline gap-3">
        <h1 className="text-xl font-semibold">{label?.name ?? "Person"}</h1>
        <span className="text-sm text-stone-500">{label?.face_count ?? 0} confirmed</span>
      </div>
      <div className="flex gap-2 border-b border-stone-200 dark:border-stone-800">
        {(["labeled", "suggested"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`-mb-px border-b-2 px-3 py-2 text-sm ${
              tab === t ? "border-stone-900 dark:border-stone-100" : "border-transparent text-stone-500"
            }`}
          >
            {t === "labeled" ? "Labelled" : "Suggested"}
            <span className="ml-1 text-xs">({(t === "labeled" ? data.labeled : data.suggested)?.length ?? 0})</span>
          </button>
        ))}
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-stone-500">
          {tab === "labeled" ? "No images labelled yet." : "No similar faces found."}
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {rows.map((img) => (
            <Link key={img.id} href={`/image/${img.id}`} className="aspect-square overflow-hidden rounded bg-stone-200 dark:bg-stone-900">
              {img.signed_url && <img src={img.signed_url} alt="" className="h-full w-full object-cover" />}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
