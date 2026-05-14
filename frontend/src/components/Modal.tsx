"use client";

import { useEffect, useId, type ReactNode } from "react";

type ModalProps = {
  onClose: () => void;
  children: ReactNode;
  className?: string;
};

// Tracks open modals so Escape only ever dismisses the topmost one
// (e.g. a confirm dialog stacked on top of the image modal).
const modalStack: string[] = [];

export function Modal({ onClose, children, className }: ModalProps) {
  const id = useId();

  useEffect(() => {
    modalStack.push(id);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && modalStack[modalStack.length - 1] === id) {
        onClose();
      }
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      const idx = modalStack.indexOf(id);
      if (idx !== -1) modalStack.splice(idx, 1);
      document.body.style.overflow = prevOverflow;
    };
  }, [id, onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-neutral-900/50 p-4 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        className={`relative my-4 w-full rounded-2xl border border-neutral-100 bg-white shadow-2xl ${
          className ?? "max-w-4xl"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-neutral-50 text-neutral-400 transition-colors hover:bg-primary-50 hover:text-primary-600"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-4 w-4"
          >
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          </svg>
        </button>
        {children}
      </div>
    </div>
  );
}
