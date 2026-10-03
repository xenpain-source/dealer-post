// Everything the Overview dashboard shows, computed from data we already
// store: listings, their cover photos, and their Facebook connection/history.
// Pure functions — no DB access — so the page does the queries and this file
// only does the math.

export type ListingStatus = "draft" | "posted" | "sold";

export type LotListing = {
  id: string;
  year: number;
  make: string;
  model: string;
  price: number;
  mileage: number;
  vin: string | null;
  bodyType: string | null;
  stockNumber: string | null;
  cleanTitle: boolean;
  oneOwner: boolean;
  status: ListingStatus;
  createdAt: Date;
  photoUrls: string[]; // in sortOrder; the first is the cover
  coverUrl: string | null;
  facebook: "posted" | "publishing" | null;
};

// What the card/pill shows. "publishing" = a Facebook post is in flight.
export type DisplayStatus = "draft" | "publishing" | "live" | "sold";

export type AttentionItem = {
  listing: LotListing;
  severity: "danger" | "warning" | "info";
  reason: string;
  action: string;
};

const DAY_MS = 24 * 60 * 60 * 1000;

// Day thresholds for the inventory-age buckets and attention flags.
export const AGE_WATCH_DAYS = 31;
export const AGE_STALE_DAYS = 61;

export function daysOnLot(listing: LotListing, now: Date): number {
  return Math.max(0, Math.floor((now.getTime() - listing.createdAt.getTime()) / DAY_MS));
}

export function displayStatus(listing: LotListing): DisplayStatus {
  if (listing.status === "sold") return "sold";
  if (listing.facebook === "publishing") return "publishing";
  if (listing.status === "posted") return "live";
  return "draft";
}

// "2019 Honda Accord EX-L". Skips the make when the model was typed with it
// already ("Ford F-150 Raptor"), so it never reads "Ford Ford F-150 Raptor".
export function vehicleName(listing: Pick<LotListing, "year" | "make" | "model">): string {
  const make = listing.make.trim();
  const model = listing.model.trim();
  const repeatsMake = make && model.toLowerCase().startsWith(`${make.toLowerCase()} `);
  return [listing.year, repeatsMake ? null : make, model].filter(Boolean).join(" ");
}

// $486k / $1.2M — for tight spots like the body-style bars.
export function formatCompactCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (value >= 1_000) return `$${Math.round(value / 1_000)}k`;
  return `$${Math.round(value)}`;
}

// The most pressing thing about a listing, or null if it's fine. One reason
// per listing, so the list reads as a to-do list rather than a wall of flags.
export function attentionFor(listing: LotListing, now: Date): AttentionItem | null {
  if (listing.status === "sold") return null;
  const days = daysOnLot(listing, now);
  if (days >= AGE_STALE_DAYS) {
    return { listing, severity: "danger", reason: `${days} days on the lot`, action: "Review" };
  }
  if (!listing.coverUrl) {
    return {
      listing,
      severity: "warning",
      reason: listing.status === "draft" ? "Draft with no photos" : "No photos",
      action: "Add photos",
    };
  }
  if (days >= AGE_WATCH_DAYS) {
    return { listing, severity: "warning", reason: `${days} days on the lot`, action: "Review price" };
  }
  if (!listing.vin) {
    return { listing, severity: "info", reason: "Missing VIN", action: "Add VIN" };
  }
  if (!listing.facebook) {
    return { listing, severity: "info", reason: "Not on Facebook yet", action: "Post" };
  }
  return null;
}

const SEVERITY_ORDER = { danger: 0, warning: 1, info: 2 } as const;

export type LotStats = {
  total: number;
  counts: Record<ListingStatus, number>;
  unsoldCount: number;
  lotValue: number;
  avgPrice: number;
  avgDaysOnLot: number | null;
  onFacebook: number;
  postedToFacebookThisWeek: number;
  draftsWithoutPhotos: number;
  aging: { label: string; hint: string; count: number; tone: "fresh" | "normal" | "watch" | "stale" }[];
  bodyStyles: { label: string; count: number; value: number }[];
  attention: AttentionItem[];
};

export function computeLotStats(
  listings: LotListing[],
  facebookPostTimes: Date[],
  now: Date,
): LotStats {
  const counts: Record<ListingStatus, number> = { draft: 0, posted: 0, sold: 0 };
  for (const l of listings) counts[l.status]++;

  const unsold = listings.filter((l) => l.status !== "sold");
  const lotValue = unsold.reduce((sum, l) => sum + l.price, 0);
  const ages = unsold.map((l) => daysOnLot(l, now));

  const bucket = (min: number, max: number) => ages.filter((d) => d >= min && d <= max).length;
  const aging: LotStats["aging"] = [
    { label: "0–15 d", hint: "Fresh", count: bucket(0, 15), tone: "fresh" },
    { label: "16–30 d", hint: "Normal", count: bucket(16, AGE_WATCH_DAYS - 1), tone: "normal" },
    { label: "31–60 d", hint: "Watch", count: bucket(AGE_WATCH_DAYS, AGE_STALE_DAYS - 1), tone: "watch" },
    { label: "61+ d", hint: "Aging", count: bucket(AGE_STALE_DAYS, Infinity), tone: "stale" },
  ];

  // Body styles are free text, so group case-insensitively and show the
  // first spelling seen, capitalized. Top four by count, the rest folded
  // into "Other".
  const groups = new Map<string, { label: string; count: number; value: number }>();
  for (const l of unsold) {
    const raw = l.bodyType?.trim() || "Not set";
    const key = raw.toLowerCase();
    const label = raw[0].toUpperCase() + raw.slice(1);
    const group = groups.get(key) ?? { label, count: 0, value: 0 };
    group.count++;
    group.value += l.price;
    groups.set(key, group);
  }
  const sorted = [...groups.values()].sort((a, b) => b.count - a.count || b.value - a.value);
  const bodyStyles = sorted.slice(0, 4);
  if (sorted.length > 4) {
    const rest = sorted.slice(4);
    bodyStyles.push({
      label: "Other",
      count: rest.reduce((s, g) => s + g.count, 0),
      value: rest.reduce((s, g) => s + g.value, 0),
    });
  }

  const attention = listings
    .map((l) => attentionFor(l, now))
    .filter((a): a is AttentionItem => a !== null)
    .sort(
      (a, b) =>
        SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity] ||
        daysOnLot(b.listing, now) - daysOnLot(a.listing, now),
    );

  const weekAgo = now.getTime() - 7 * DAY_MS;

  return {
    total: listings.length,
    counts,
    unsoldCount: unsold.length,
    lotValue,
    avgPrice: unsold.length ? Math.round(lotValue / unsold.length) : 0,
    avgDaysOnLot: ages.length ? Math.round(ages.reduce((s, d) => s + d, 0) / ages.length) : null,
    onFacebook: unsold.filter((l) => l.facebook === "posted").length,
    postedToFacebookThisWeek: facebookPostTimes.filter((t) => t.getTime() >= weekAgo).length,
    draftsWithoutPhotos: listings.filter((l) => l.status === "draft" && !l.coverUrl).length,
    aging,
    bodyStyles,
    attention,
  };
}
