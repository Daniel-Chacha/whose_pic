"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSessionStore } from "@/lib/sessionStore";
import { ConfirmDialog } from "@/components/ConfirmDialog";

export function ClearSessionButton() {
  const router = useRouter();
  const clearSession = useSessionStore((s) => s.clearSession);
  const hasData = useSessionStore(
    (s) => s.images.length > 0 || s.labels.length > 0,
  );
  const [confirming, setConfirming] = useState(false);

  if (!hasData) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="ml-auto text-sm text-neutral-400 transition-colors hover:text-red-600"
      >
        Clear session
      </button>
      {confirming && (
        <ConfirmDialog
          title="Clear this session?"
          message="All photos and labels in this browser session will be removed. This can't be undone."
          confirmLabel="Clear everything"
          destructive
          onCancel={() => setConfirming(false)}
          onConfirm={async () => {
            setConfirming(false);
            await clearSession();
            router.push("/gallery");
          }}
        />
      )}
    </>
  );
}
