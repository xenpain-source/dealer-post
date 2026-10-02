"use client";

import { useEffect } from "react";

// Transient confirmation banner (.dl-toast, see dealerloft-components.css),
// fixed to the bottom-right corner and auto-dismissed after `duration`.
export function Toast({
  message,
  onDismiss,
  duration = 3000,
}: {
  message: string;
  onDismiss: () => void;
  duration?: number;
}) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onDismiss]);

  return (
    <div
      className="dl-toast"
      role="status"
      style={{ position: "fixed", right: 24, bottom: 24, zIndex: 50 }}
    >
      <span>{message}</span>
      <button type="button" className="dl-btn dl-btn--ghost dl-btn--sm" onClick={onDismiss}>
        Dismiss
      </button>
    </div>
  );
}
