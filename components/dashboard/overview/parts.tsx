import type { ReactNode } from "react";
import type { DisplayStatus } from "@/lib/lot-stats";

const PILL: Record<DisplayStatus, { className: string; label: string }> = {
  draft: { className: "dl-pill--draft", label: "Draft" },
  publishing: { className: "dl-pill--publishing", label: "Publishing" },
  live: { className: "dl-pill--live", label: "Live" },
  sold: { className: "dl-pill--sold", label: "Sold" },
};

export function StatusPill({ status, style }: { status: DisplayStatus; style?: React.CSSProperties }) {
  const pill = PILL[status];
  return (
    <span className={`dl-pill ${pill.className}`} style={style}>
      {pill.label}
    </span>
  );
}

export function StatCard({
  label,
  value,
  detail,
  tone,
}: {
  label: string;
  value: ReactNode;
  detail?: ReactNode;
  tone?: "up" | "warn";
}) {
  return (
    <div className="dl-card dl-stat">
      <div className="k">{label}</div>
      <div className="v">{value}</div>
      {detail && (
        <div
          className="d"
          style={{
            color: tone === "up" ? "var(--success-fg)" : tone === "warn" ? "var(--warning-fg)" : "var(--text-muted)",
          }}
        >
          {detail}
        </div>
      )}
    </div>
  );
}

// Cover photo, or the kit's neutral gradient (from .dl-listing .media) when
// a listing has none yet.
export function CoverPhoto({ url, children }: { url: string | null; children?: ReactNode }) {
  return (
    <div className="media">
      {url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt=""
          loading="lazy"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
        />
      )}
      {children}
    </div>
  );
}
