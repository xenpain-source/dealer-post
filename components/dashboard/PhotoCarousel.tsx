"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

// A listing's photos with previous/next arrows, a "2 / 5" counter, swipe on
// touch screens, and optional thumbnails to jump straight to a photo.
// Overlays (status pill, days badge) go in `children` and sit on top of the
// photo. With no photos it shows the kit's neutral placeholder.
//
// Arrow clicks never bubble, so the carousel can sit inside a clickable
// card without opening the listing.
export function PhotoCarousel({
  photos,
  label,
  aspectRatio = "4 / 3",
  thumbnails = false,
  frameStyle,
  children,
}: {
  photos: string[];
  label: string; // e.g. "2019 Honda Accord EX-L", for alt text and arrow labels
  aspectRatio?: string;
  thumbnails?: boolean;
  frameStyle?: React.CSSProperties; // extra styles for the main photo frame
  children?: ReactNode;
}) {
  const [rawIndex, setIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const count = photos.length;
  // Photos can be removed while this is showing (the listing page edits
  // them live), so never point past the end.
  const index = count ? Math.min(rawIndex, count - 1) : 0;
  const multiple = count > 1;

  // Warm the next photo so the arrow feels instant.
  useEffect(() => {
    if (!multiple) return;
    const next = new Image();
    next.src = photos[(index + 1) % count];
  }, [index, count, multiple, photos]);

  function go(delta: number) {
    setIndex((index + delta + count) % count);
  }

  function arrow(delta: number) {
    return (event: React.MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      go(delta);
    };
  }

  return (
    <div>
      <div
        className="media dl-carousel"
        style={{
          position: "relative",
          aspectRatio,
          overflow: "hidden",
          background: "linear-gradient(160deg, #C9CFDA, #8B93A3 70%, #5B6270)",
          ...frameStyle,
        }}
        onTouchStart={(e) => {
          touchStartX.current = e.touches[0].clientX;
        }}
        onTouchEnd={(e) => {
          if (touchStartX.current === null || !multiple) return;
          const dx = e.changedTouches[0].clientX - touchStartX.current;
          touchStartX.current = null;
          if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
        }}
      >
        {count > 0 && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={photos[index]}
            src={photos[index]}
            alt={`${label}, photo ${index + 1} of ${count}`}
            loading="lazy"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
          />
        )}

        {children}

        {multiple && (
          <>
            <button
              type="button"
              className="dl-carousel__arrow"
              style={{ left: 8 }}
              aria-label={`Previous photo of ${label}`}
              onClick={arrow(-1)}
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M15 6l-6 6 6 6" />
              </svg>
            </button>
            <button
              type="button"
              className="dl-carousel__arrow"
              style={{ right: 8 }}
              aria-label={`Next photo of ${label}`}
              onClick={arrow(1)}
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M9 6l6 6-6 6" />
              </svg>
            </button>
            <span
              aria-hidden
              style={{
                position: "absolute",
                right: 10,
                bottom: 10,
                zIndex: 2,
                background: "rgba(14,15,18,.72)",
                color: "#fff",
                font: "500 12px/1 var(--dl-font-mono)",
                padding: "5px 7px",
                borderRadius: 6,
              }}
            >
              {index + 1} / {count}
            </span>
          </>
        )}
      </div>

      {thumbnails && multiple && (
        <div className="mt-2 grid grid-cols-5 gap-2 sm:grid-cols-8">
          {photos.map((url, i) => (
            <button
              key={url}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Show photo ${i + 1} of ${count}`}
              aria-current={i === index}
              className="aspect-square overflow-hidden"
              style={{
                padding: 0,
                cursor: "pointer",
                borderRadius: "var(--dl-radius-md)",
                border: i === index ? "2px solid var(--accent)" : "1px solid var(--border)",
                background: "var(--surface-2)",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" loading="lazy" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
