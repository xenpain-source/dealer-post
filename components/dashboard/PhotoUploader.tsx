"use client";

import { useRef, useState } from "react";

const labelClass = "block text-sm font-medium text-zinc-700";

type UploadedPhoto = { previewUrl: string; publicUrl: string };

export function PhotoUploader({
  onUploaded,
}: {
  onUploaded: (urls: string[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

      setPhotos((prev) => {
        const combined = [...prev, ...newPhotos];
        onUploaded(combined.map((p) => p.publicUrl));
        return combined;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function removePhoto(publicUrl: string) {
    setPhotos((prev) => {
      const next = prev.filter((p) => p.publicUrl !== publicUrl);
      onUploaded(next.map((p) => p.publicUrl));
      return next;
    });
  }

  return (
    <div>
      <label htmlFor="photos" className={labelClass}>
        Photos
      </label>

      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          void handleFiles(e.dataTransfer.files);
        }}
        className="mt-3 flex h-36 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-zinc-300 text-sm text-zinc-400 transition-colors hover:border-indigo-400 hover:text-indigo-500"
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

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

      {photos.length > 0 && (
        <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6">
          {photos.map((photo) => (
            <div key={photo.publicUrl} className="group relative aspect-square overflow-hidden rounded-lg border border-zinc-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.previewUrl}
                alt=""
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() => removePhoto(photo.publicUrl)}
                className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
                aria-label="Remove photo"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
