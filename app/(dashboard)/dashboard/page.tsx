import Link from "next/link";
import type { Metadata } from "next";
import { and, asc, desc, eq, gte, inArray } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { listings, listingPhotos, platformConnections, postingHistory } from "@/lib/db/schema";
import { getCurrentDealer } from "@/lib/db/dealer";
import { computeLotStats, type LotListing } from "@/lib/lot-stats";
import { ShowroomView, type ShowroomFilter } from "@/components/dashboard/overview/ShowroomView";
import { LotHealthView } from "@/components/dashboard/overview/LotHealthView";

export const metadata: Metadata = {
  title: "Overview",
};

type View = "showroom" | "health";

const VIEWS: { key: View; label: string; href: string }[] = [
  { key: "showroom", label: "Showroom", href: "/dashboard" },
  { key: "health", label: "Lot health", href: "/dashboard?view=health" },
];

const FILTERS: ShowroomFilter[] = ["all", "posted", "draft", "sold"];

export default async function DashboardOverview({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; status?: string }>;
}) {
  const params = await searchParams;
  const view: View = params.view === "health" ? "health" : "showroom";
  const filter: ShowroomFilter = FILTERS.includes(params.status as ShowroomFilter)
    ? (params.status as ShowroomFilter)
    : "all";

  const { dealer } = await getCurrentDealer();
  const now = new Date();
  const rows = await db
    .select()
    .from(listings)
    .where(eq(listings.dealerId, dealer.id))
    .orderBy(desc(listings.createdAt));

  const ids = rows.map((l) => l.id);
  const coverByListing = new Map<string, string>();
  const facebookByListing = new Map<string, LotListing["facebook"]>();
  let facebookPostTimes: Date[] = [];

  if (ids.length > 0) {
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const [photos, connections, history] = await Promise.all([
      db
        .select({ listingId: listingPhotos.listingId, url: listingPhotos.url })
        .from(listingPhotos)
        .where(inArray(listingPhotos.listingId, ids))
        .orderBy(asc(listingPhotos.sortOrder)),
      db
        .select({
          listingId: platformConnections.listingId,
          status: platformConnections.status,
          tokenExpiresAt: platformConnections.tokenExpiresAt,
        })
        .from(platformConnections)
        .where(and(inArray(platformConnections.listingId, ids), eq(platformConnections.platform, "facebook"))),
      db
        .select({ createdAt: postingHistory.createdAt })
        .from(postingHistory)
        .where(
          and(
            inArray(postingHistory.listingId, ids),
            eq(postingHistory.platform, "facebook"),
            eq(postingHistory.action, "created"),
            gte(postingHistory.createdAt, weekAgo),
          ),
        ),
    ]);

    // First photo by sortOrder is the cover.
    for (const photo of photos) {
      if (!coverByListing.has(photo.listingId)) coverByListing.set(photo.listingId, photo.url);
    }
    // Same rule as the platforms status route: a pending post only counts
    // while its one-time token is still live.
    for (const c of connections) {
      if (c.status === "posted") facebookByListing.set(c.listingId, "posted");
      else if (c.status === "pending" && c.tokenExpiresAt && c.tokenExpiresAt > now) {
        facebookByListing.set(c.listingId, "publishing");
      }
    }
    facebookPostTimes = history.map((h) => h.createdAt);
  }

  const lot: LotListing[] = rows.map((l) => ({
    id: l.id,
    year: l.year,
    make: l.make,
    model: l.model,
    price: l.price,
    mileage: l.mileage,
    vin: l.vin,
    bodyType: l.bodyType,
    stockNumber: l.stockNumber,
    cleanTitle: l.cleanTitle,
    oneOwner: l.oneOwner,
    status: l.status,
    createdAt: l.createdAt,
    coverUrl: coverByListing.get(l.id) ?? null,
    facebook: facebookByListing.get(l.id) ?? null,
  }));
  const stats = computeLotStats(lot, facebookPostTimes, now);

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="dl-h1">Overview</h1>
          <p className="dl-small mt-1">
            {dealer.name} · {stats.unsoldCount} car{stats.unsoldCount === 1 ? "" : "s"} on the lot
          </p>
        </div>
        <Link href="/dashboard/listings/new" className="dl-btn dl-btn--primary w-fit">
          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Add a car
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="dl-card dl-empty mt-8">
          <b>Your lot is empty.</b>
          Add your first car and it shows up here with its photos, price and status.
          <Link href="/dashboard/listings/new" className="dl-link">
            Add a car
          </Link>
        </div>
      ) : (
        <>
          <div
            role="tablist"
            aria-label="Overview view"
            className="mt-6 inline-flex"
            style={{ padding: 4, gap: 4, borderRadius: 999, background: "var(--surface-2)" }}
          >
            {VIEWS.map((v) => {
              const active = view === v.key;
              return (
                <Link
                  key={v.key}
                  href={v.href}
                  role="tab"
                  aria-selected={active}
                  scroll={false}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 999,
                    fontSize: 14,
                    fontWeight: 600,
                    textDecoration: "none",
                    color: active ? "var(--text)" : "var(--text-muted)",
                    background: active ? "var(--surface)" : "transparent",
                    boxShadow: active ? "var(--shadow-sm)" : "none",
                  }}
                >
                  {v.label}
                </Link>
              );
            })}
          </div>

          {view === "health" ? (
            <LotHealthView listings={lot} stats={stats} />
          ) : (
            <ShowroomView listings={lot} stats={stats} filter={filter} now={now} />
          )}
        </>
      )}
    </div>
  );
}
