"use client";

import { useRef, useState } from "react";

type UploadedPhoto = { previewUrl: string; publicUrl: string };

// Upload, remove and reorder a listing's photos. The first photo is the
// cover everywhere the listing appears. Reorder by dragging (mouse) or with
// each photo's move/cover buttons (touch screens, keyboard), and every
// change reports the full ordered list through onUploaded.
export function PhotoUploader({
  onUploaded,
  initialUrls = [],
}: {
  onUploaded: (urls: string[]) => void;
  initialUrls?: string[]; // already-saved photos, in their current order
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [photos, setPhotos] = useState<UploadedPhoto[]>(() =>
    initialUrls.map((url) => ({ previewUrl: url, publicUrl: url })),
  );
  // The ref drives the reorder (read synchronously on every drag-over); the
  // state only dims the photo being dragged.
  const dragFrom = useRef<number | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Functional so rapid-fire changes (drag-over fires many times a second)
  // always build on the latest order, never a stale one.
  function update(change: (prev: UploadedPhoto[]) => UploadedPhoto[]) {
    setPhotos((prev) => {
      const next = change(prev);
      if (next !== prev) onUploaded(next.map((p) => p.publicUrl));
      return next;
    });
  }

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList);
    setError(null);
    setUploading(true);

    try {
      const presignRes = await fetch("/api/uploads/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          files: files.map((f) => ({ name: f.name, type: f.type })),
        }),
      });

      if (!presignRes.ok) {
        const data = await presignRes.json().catch(() => ({}));
        throw new Error(data.error ?? "Couldn't prepare the upload.");
      }

      const { uploads } = await presignRes.json();

      const newPhotos: UploadedPhoto[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const { uploadUrl, publicUrl } = uploads[i];

        const putRes = await fetch(uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": file.type },
          body: file,
        });
        if (!putRes.ok) throw new Error(`Upload failed for ${file.name}.`);

        newPhotos.push({ previewUrl: URL.createObjectURL(file), publicUrl });
      }

      update((prev) => [...prev, ...newPhotos]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function removePhoto(index: number) {
    update((prev) => prev.filter((_, i) => i !== index));
  }

  function movePhoto(from: number, to: number) {
    update((prev) => {
      if (to < 0 || to >= prev.length || from === to) return prev;
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  }

  const tileButton: React.CSSProperties = {
    width: 32,
    height: 32,
    border: 0,
    borderRadius: 8,
    background: "rgba(14,15,18,.72)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    fontSize: 14,
    lineHeight: 1,
  };

  return (
    <div className="dl-field">
      <label htmlFor="photos" className="dl-label">
        Photos
      </label>

      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        onDragOver={(e) => {
          if (e.dataTransfer.types.includes("Files")) e.preventDefault();
        }}
        onDrop={(e) => {
          if (!e.dataTransfer.types.includes("Files")) return;
          e.preventDefault();
          void handleFiles(e.dataTransfer.files);
        }}
        className="dl-small flex h-36 cursor-pointer flex-col items-center justify-center gap-2 text-center"
        style={{
          border: "2px dashed var(--border-strong)",
          borderRadius: "var(--dl-radius-lg)",
          color: "var(--text-muted)",
        }}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="h-6 w-6"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 16.5V18a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-1.5M16 8l-4-4-4 4M12 4v12" />
        </svg>
        {uploading ? "Uploading…" : "Drag photos here or tap to upload"}
        <input
          ref={inputRef}
          id="photos"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {error && (
        <p className="dl-help" style={{ color: "var(--danger-fg)" }}>
          {error}
        </p>
      )}

      {photos.length > 0 && (
        <>
          <p className="dl-help">
            The first photo is the cover on every channel.
            {photos.length > 1 && " Drag photos to reorder, or use the arrows."}
          </p>
          <ol className="grid grid-cols-2 gap-3 sm:grid-cols-3" style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {photos.map((photo, index) => (
              <li
                key={photo.publicUrl}
                draggable={photos.length > 1}
                onDragStart={(e) => {
                  dragFrom.current = index;
                  setDragIndex(index);
                  e.dataTransfer.effectAllowed = "move";
                }}
                onDragOver={(e) => {
                  const from = dragFrom.current;
                  if (from === null) return;
                  e.preventDefault();
                  if (from !== index) {
                    movePhoto(from, index);
                    dragFrom.current = index;
                    setDragIndex(index);
                  }
                }}
                onDrop={(e) => e.preventDefault()}
                onDragEnd={() => {
                  dragFrom.current = null;
                  setDragIndex(null);
                }}
                className="relative aspect-[4/3] overflow-hidden"
                style={{
                  borderRadius: "var(--dl-radius-md)",
                  border: index === 0 ? "2px solid var(--accent)" : "1px solid var(--border)",
                  opacity: dragIndex === index ? 0.5 : 1,
                  cursor: photos.length > 1 ? "grab" : "default",
                  background: "var(--surface-2)",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.previewUrl} alt={`Photo ${index + 1}`} className="h-full w-full object-cover" draggable={false} />

                {index === 0 && (
                  <span
                    className="dl-pill"
                    style={{ position: "absolute", top: 6, left: 6, background: "var(--accent)", color: "#fff" }}
                  >
                    Cover
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => removePhoto(index)}
                  style={{ ...tileButton, position: "absolute", top: 6, right: 6 }}
                  aria-label={`Remove photo ${index + 1}`}
                >
                  ×
                </button>

                {photos.length > 1 && (
                  <div className="absolute flex gap-1" style={{ left: 6, right: 6, bottom: 6 }}>
                    <button
                      type="button"
                      onClick={() => movePhoto(index, index - 1)}
                      disabled={index === 0}
                      style={{ ...tileButton, opacity: index === 0 ? 0.35 : 1 }}
                      aria-label={`Move photo ${index + 1} earlier`}
                    >
                      ◀
                    </button>
                    <button
                      type="button"
                      onClick={() => movePhoto(index, index + 1)}
                      disabled={index === photos.length - 1}
                      style={{ ...tileButton, opacity: index === photos.length - 1 ? 0.35 : 1 }}
                      aria-label={`Move photo ${index + 1} later`}
                    >
                      ▶
                    </button>
                    {index !== 0 && (
                      <button
                        type="button"
                        onClick={() => movePhoto(index, 0)}
                        style={{ ...tileButton, width: "auto", padding: "0 10px", marginLeft: "auto", fontSize: 12, fontWeight: 700 }}
                        aria-label={`Make photo ${index + 1} the cover`}
                      >
                        Make cover
                      </button>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ol>
        </>
      )}
    </div>
  );
}
