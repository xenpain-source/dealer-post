"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export function ListingRowActions({ listingId }: { listingId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleDelete() {
    if (!confirm("Delete this listing? This can't be undone.")) return;
    setError(null);
    startTransition(async () => {
      const res = await fetch(`/api/listings/${listingId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        setError("Couldn't delete — try again.");
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="flex items-center justify-end gap-2">
      {error && <span className="text-xs text-red-600">{error}</span>}
      <button
        type="button"
        onClick={handleDelete}
        disabled={isPending}
        className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-zinc-500 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
      >
        {isPending ? "Deleting…" : "Delete"}
      </button>
    </div>
  );
}
