"use client";

import { useEffect, useRef, useState } from "react";
import type { Face } from "@/lib/types";

type Props = {
  src: string;
  faces: Face[];
  selectedFaceId?: string | null;
  onSelect?: (faceId: string) => void;
};

export function BBoxOverlay({ src, faces, selectedFaceId, onSelect }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ w: number; h: number }>({ w: 0, h: 0 });

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const img = el.querySelector("img");
      if (img) setSize({ w: img.clientWidth, h: img.clientHeight });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={wrapRef} className="relative inline-block">
      <img
        src={src}
        alt=""
        className="block max-h-[80vh] w-auto max-w-full rounded"
        onLoad={(e) => {
          const img = e.currentTarget;
          setSize({ w: img.clientWidth, h: img.clientHeight });
        }}
      />
      <svg className="pointer-events-none absolute inset-0" width={size.w} height={size.h}>
        {faces.map((f) => {
          const x = f.bbox.x * size.w;
          const y = f.bbox.y * size.h;
          const w = f.bbox.w * size.w;
          const h = f.bbox.h * size.h;
          const selected = f.id === selectedFaceId;
          const stroke = selected ? "#22c55e" : f.label_id ? "#3b82f6" : "#f59e0b";
          return (
            <g key={f.id}>
              <rect
                x={x} y={y} width={w} height={h}
                fill="transparent"
                stroke={stroke} strokeWidth={selected ? 3 : 2}
                className="pointer-events-auto cursor-pointer"
                onClick={() => onSelect?.(f.id)}
              />
              {f.label_name && (
                <text
                  x={x + 4} y={y + 14}
                  className="pointer-events-none"
                  fill={stroke}
                  fontSize="12"
                  style={{ paintOrder: "stroke", stroke: "#000", strokeWidth: 3 }}
                >
                  {f.label_name}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
