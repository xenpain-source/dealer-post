import Link from "next/link";
import { formatCurrency, formatMileage } from "@/lib/description";
import {
  AGE_WATCH_DAYS,
  daysOnLot,
  displayStatus,
  vehicleName,
  type ListingStatus,
  type LotListing,
  type LotStats,
} from "@/lib/lot-stats";
import { PhotoCarousel } from "@/components/dashboard/PhotoCarousel";
import { ListingCardShell, StatCard, StatusPill } from "./parts";

const MAX_CARDS = 8;

export type ShowroomFilter = "all" | ListingStatus;

const FILTERS: { key: ShowroomFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "posted", label: "Live" },
  { key: "draft", label: "Drafts" },
  { key: "sold", label: "Sold" },
];

function Flag({ children, warn }: { children: React.ReactNode; warn?: boolean }) {
  return (
    <span
      style={{
        font: "600 11px/1 var(--dl-font-body)",
        padding: "5px 8px",
        borderRadius: "var(--dl-radius-xs, 4px)",
        background: warn ? "var(--warning-bg)" : "var(--surface-2)",
        color: warn ? "var(--warning-fg)" : "var(--neutral-fg)",
      }}
    >
      {children}
    </span>
  );
}

function ListingCard({ listing, now }: { listing: LotListing; now: Date }) {
  const sold = listing.status === "sold";
  const days = daysOnLot(listing, now);
  const specs = [formatMileage(listing.mileage), listing.bodyType, listing.stockNumber && `Stock ${listing.stockNumber}`]
    .filter(Boolean)
    .join(" · ");

  const name = vehicleName(listing);

  return (
    <ListingCardShell href={`/dashboard/listings/${listing.id}`} label={name}>
      <PhotoCarousel photos={listing.photoUrls} label={name}>
        <StatusPill status={displayStatus(listing)} />
        {!sold && (
          <span
            className="dl-data"
            title={`${days} days on the lot`}
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              background: "rgba(14,15,18,.72)",
              color: "#fff",
              font: "500 12px/1 var(--dl-font-mono)",
              padding: "6px 8px",
              borderRadius: 6,
            }}
          >
            {days} d
          </span>
        )}
      </PhotoCarousel>
      <div className="body">
        <div className="title">{name}</div>
        <div className="price">{formatCurrency(listing.price)}</div>
        <div className="specs">{specs}</div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {listing.cleanTitle && <Flag>Clean title</Flag>}
          {listing.oneOwner && <Flag>One owner</Flag>}
          {!sold && !listing.coverUrl && <Flag warn>Add photos</Flag>}
          {!sold && !listing.vin && <Flag warn>No VIN</Flag>}
          {!sold && days >= AGE_WATCH_DAYS && <Flag warn>{days} days on the lot</Flag>}
        </div>
      </div>
    </ListingCardShell>
  );
}

export function ShowroomView({
  listings,
  stats,
  filter,
  now,
}: {
  listings: LotListing[];
  stats: LotStats;
  filter: ShowroomFilter;
  now: Date;
}) {
  const shown = (filter === "all" ? listings : listings.filter((l) => l.status === filter)).slice(0, MAX_CARDS);
  const filterCount = (key: ShowroomFilter) => (key === "all" ? stats.total : stats.counts[key]);

  return (
    <>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Lot value"
          value={<span className="dl-data">{formatCurrency(stats.lotValue)}</span>}
          detail={`Asking price, ${stats.unsoldCount} unsold car${stats.unsoldCount === 1 ? "" : "s"}`}
        />
        <StatCard
          label="Live"
          value={<span className="dl-data">{stats.counts.posted}</span>}
          detail={
            stats.postedToFacebookThisWeek > 0
              ? `+${stats.postedToFacebookThisWeek} on Facebook this week`
              : "None posted this week"
          }
          tone={stats.postedToFacebookThisWeek > 0 ? "up" : undefined}
        />
        <StatCard
          label="Avg days on lot"
          value={<span className="dl-data">{stats.avgDaysOnLot ?? "—"}</span>}
          detail="Unsold cars"
        />
        <StatCard
          label="Drafts"
          value={<span className="dl-data">{stats.counts.draft}</span>}
          detail={stats.draftsWithoutPhotos > 0 ? `${stats.draftsWithoutPhotos} missing photos` : "All have photos"}
          tone={stats.draftsWithoutPhotos > 0 ? "warn" : undefined}
        />
      </div>

      <section className="mt-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="dl-h4">Recent listings</h2>
          <div className="dl-tabs" role="tablist" aria-label="Filter recent listings">
            {FILTERS.map((f) => (
              <Link
                key={f.key}
                href={f.key === "all" ? "/dashboard" : `/dashboard?status=${f.key}`}
                className="dl-tab"
                role="tab"
                aria-selected={filter === f.key}
                style={{ textDecoration: "none" }}
                scroll={false}
              >
                {f.label}
                <span className="count">{filterCount(f.key)}</span>
              </Link>
            ))}
          </div>
        </div>

        {shown.length === 0 ? (
          <div className="dl-empty mt-4">
            <b>No cars here.</b>
            <Link href="/dashboard" className="dl-link" scroll={false}>
              Show all listings
            </Link>
          </div>
        ) : (
          <div className="mt-4 grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))" }}>
            {shown.map((listing) => (
              <ListingCard key={listing.id} listing={listing} now={now} />
            ))}
          </div>
        )}

        <Link href="/dashboard/listings" className="dl-link mt-5 inline-flex items-center gap-1">
          View all {stats.total} listings
          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </Link>
      </section>
    </>
  );
}
