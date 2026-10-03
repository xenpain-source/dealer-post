import type { ReactNode } from "react";
import Link from "next/link";
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

// A listing card that opens the listing when clicked anywhere, while still
// letting the photo carousel's arrows work. The link is stretched over the
// whole card as a sibling (z-index 1) rather than wrapping it, because the
// arrows are buttons and buttons can't live inside a link; the arrows sit
// above it at z-index 2.
export function ListingCardShell({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="dl-listing" style={{ position: "relative" }}>
      {children}
      <Link href={href} aria-label={label} style={{ position: "absolute", inset: 0, zIndex: 1 }} />
    </div>
  );
}
