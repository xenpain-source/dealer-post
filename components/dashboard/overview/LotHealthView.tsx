import Link from "next/link";
import { formatCurrency } from "@/lib/description";
import {
  displayStatus,
  formatCompactCurrency,
  vehicleName,
  type AttentionItem,
  type LotListing,
  type LotStats,
} from "@/lib/lot-stats";
import { PhotoCarousel } from "@/components/dashboard/PhotoCarousel";
import { ListingCardShell, StatCard, StatusPill } from "./parts";

const MAX_ATTENTION = 6;
const NEWEST_COUNT = 4;

const AGE_COLORS = {
  fresh: "var(--success-dot)",
  normal: "var(--accent)",
  watch: "var(--warning-dot)",
  stale: "var(--danger-solid)",
} as const;

const SEVERITY_STYLE: Record<AttentionItem["severity"], { bg: string; fg: string; icon: string }> = {
  danger: { bg: "var(--danger-bg)", fg: "var(--danger-fg)", icon: "!" },
  warning: { bg: "var(--warning-bg)", fg: "var(--warning-fg)", icon: "!" },
  info: { bg: "var(--accent-soft)", fg: "var(--accent-text)", icon: "i" },
};

function InventoryAge({ stats }: { stats: LotStats }) {
  const total = stats.aging.reduce((s, b) => s + b.count, 0);
  return (
    <>
      <h3 className="dl-h4">Inventory age</h3>
      <p className="dl-small mt-1">Unsold cars by days on the lot. The longer a car sits, the more it costs you.</p>
      {total === 0 ? (
        <p className="dl-small mt-4">No unsold cars.</p>
      ) : (
        <>
          <div
            className="mt-4 flex overflow-hidden"
            style={{ height: 14, borderRadius: 7, gap: 3 }}
            role="img"
            aria-label={stats.aging.map((b) => `${b.count} cars ${b.label}`).join(", ")}
          >
            {stats.aging
              .filter((b) => b.count > 0)
              .map((b) => (
                <div key={b.tone} style={{ flex: b.count, background: AGE_COLORS[b.tone] }} title={`${b.count} · ${b.label}`} />
              ))}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {stats.aging.map((b) => (
              <div key={b.tone} className="flex items-start gap-2">
                <span
                  aria-hidden
                  style={{ width: 8, height: 8, borderRadius: 2, marginTop: 6, flexShrink: 0, background: AGE_COLORS[b.tone] }}
                />
                <div>
                  <div className="dl-data" style={{ fontSize: 20, fontWeight: 500, lineHeight: 1.2 }}>
                    {b.count}
                  </div>
                  <div className="dl-small">
                    {b.label} · {b.hint}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}

function BodyStyles({ stats }: { stats: LotStats }) {
  const max = Math.max(1, ...stats.bodyStyles.map((g) => g.count));
  return (
    <>
      <h3 className="dl-h4">By body style</h3>
      <p className="dl-small mt-1">Unsold cars and their asking value.</p>
      {stats.bodyStyles.length === 0 ? (
        <p className="dl-small mt-4">No unsold cars.</p>
      ) : (
        <div className="mt-4 grid gap-3">
          {stats.bodyStyles.map((g) => (
            <div key={g.label} className="grid items-center gap-3" style={{ gridTemplateColumns: "110px minmax(0,1fr) auto" }}>
              <span className="truncate" style={{ fontSize: 14, fontWeight: 600 }}>
                {g.label}
              </span>
              <span style={{ height: 10, borderRadius: 5, background: "var(--surface-2)", overflow: "hidden" }}>
                <span
                  style={{ display: "block", height: "100%", width: `${(g.count / max) * 100}%`, background: "var(--accent)", borderRadius: 5 }}
                />
              </span>
              <span className="dl-data" style={{ fontSize: 13, textAlign: "right" }}>
                {g.count} · {formatCompactCurrency(g.value)}
              </span>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function NeedsAttention({ items }: { items: AttentionItem[] }) {
  const shown = items.slice(0, MAX_ATTENTION);
  return (
    <>
      <h3 className="dl-h4">Needs attention</h3>
      <p className="dl-small mt-1">
        {items.length === 0
          ? "Nothing right now — every car has photos, a VIN and a Facebook post."
          : `${items.length} listing${items.length === 1 ? "" : "s"}`}
      </p>
      {shown.length > 0 && (
        <ul className="mt-3" style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {shown.map((item) => {
            const s = SEVERITY_STYLE[item.severity];
            return (
              <li key={item.listing.id} style={{ borderBottom: "1px solid var(--border)" }}>
                <Link
                  href={`/dashboard/listings/${item.listing.id}`}
                  className="flex items-center gap-3 py-3"
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <span
                    aria-hidden
                    className="flex shrink-0 items-center justify-center"
                    style={{ width: 32, height: 32, borderRadius: 8, background: s.bg, color: s.fg, font: "600 14px var(--dl-font-display)" }}
                  >
                    {s.icon}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate" style={{ fontSize: 14, fontWeight: 600 }}>
                      {vehicleName(item.listing)}
                    </span>
                    <span className="dl-small">{item.reason}</span>
                  </span>
                  <span className="ml-auto shrink-0" style={{ fontSize: 13, fontWeight: 700, color: "var(--accent-text)" }}>
                    {item.action}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
      {items.length > MAX_ATTENTION && (
        <Link href="/dashboard/listings" className="dl-link mt-3 inline-block">
          {items.length - MAX_ATTENTION} more in Listings
        </Link>
      )}
    </>
  );
}

function NewestStrip({ listings }: { listings: LotListing[] }) {
  return (
    <div className="mt-4 grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))" }}>
      {listings.map((listing) => {
        const name = vehicleName(listing);
        return (
          <ListingCardShell key={listing.id} href={`/dashboard/listings/${listing.id}`} label={name}>
            <PhotoCarousel photos={listing.photoUrls} label={name}>
              <StatusPill status={displayStatus(listing)} />
            </PhotoCarousel>
            <div className="body" style={{ padding: "10px 12px 12px" }}>
              <div className="truncate" style={{ fontSize: 13, fontWeight: 600 }}>
                {name}
              </div>
              <div className="dl-data" style={{ fontSize: 15, fontWeight: 500 }}>
                {formatCurrency(listing.price)}
              </div>
            </div>
          </ListingCardShell>
        );
      })}
    </div>
  );
}

export function LotHealthView({ listings, stats }: { listings: LotListing[]; stats: LotStats }) {
  const notOnFacebook = stats.unsoldCount - stats.onFacebook;
  const newest = listings.filter((l) => l.status !== "sold").slice(0, NEWEST_COUNT);

  return (
    <>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Lot value"
          value={<span className="dl-data">{formatCurrency(stats.lotValue)}</span>}
          detail={stats.unsoldCount ? `Avg ${formatCurrency(stats.avgPrice)} per car` : "No unsold cars"}
        />
        <StatCard
          label="On Facebook"
          value={
            <span className="dl-data">
              {stats.onFacebook} / {stats.unsoldCount}
            </span>
          }
          detail={notOnFacebook > 0 ? `${notOnFacebook} not posted yet` : "Every unsold car"}
          tone={notOnFacebook > 0 ? "warn" : "up"}
        />
        <StatCard
          label="Avg days on lot"
          value={<span className="dl-data">{stats.avgDaysOnLot ?? "—"}</span>}
          detail="Unsold cars"
        />
        <StatCard
          label="Needs attention"
          value={<span className="dl-data">{stats.attention.length}</span>}
          detail={stats.attention.length ? "See the list below" : "All clear"}
          tone={stats.attention.length ? "warn" : "up"}
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.618fr_1fr]">
        <div className="dl-card">
          <InventoryAge stats={stats} />
          <div className="mt-8">
            <BodyStyles stats={stats} />
          </div>
        </div>
        <div className="dl-card">
          <NeedsAttention items={stats.attention} />
        </div>
      </div>

      {newest.length > 0 && (
        <section className="mt-10">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="dl-h4">Newest on the lot</h2>
            <Link href="/dashboard/listings" className="dl-link">
              View all {stats.total}
            </Link>
          </div>
          <NewestStrip listings={newest} />
        </section>
      )}
    </>
  );
}
