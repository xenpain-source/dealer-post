import Link from "next/link";
import type { Metadata } from "next";
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { listings } from "@/lib/db/schema";
import { getCurrentDealer } from "@/lib/db/dealer";

export const metadata: Metadata = {
  title: "Overview",
};

export default async function DashboardOverview() {
  const { dealer } = await getCurrentDealer();
  const rows = await db
    .select()
    .from(listings)
    .where(eq(listings.dealerId, dealer.id))
    .orderBy(desc(listings.createdAt));

  const posted = rows.filter((l) => l.status === "posted").length;
  const drafts = rows.filter((l) => l.status === "draft").length;
  const sold = rows.filter((l) => l.status === "sold").length;
  const recent = rows.slice(0, 5);

  const stats = [
    { k: "Total cars", v: rows.length },
    { k: "Posted", v: posted },
    { k: "Drafts", v: drafts },
    { k: "Sold", v: sold },
  ];

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="dl-h1">Overview</h1>
          <p className="dl-small mt-1">Your real inventory for {dealer.name}.</p>
        </div>
        <Link href="/dashboard/listings/new" className="dl-btn dl-btn--primary w-fit">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="h-4 w-4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
          Add a car
        </Link>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.k} className="dl-card dl-stat">
            <div className="k">{stat.k}</div>
            <div className="v dl-data">{stat.v}</div>
          </div>
        ))}
      </div>

      <div className="dl-card mt-8">
        <h2 className="dl-h4">Recent listings</h2>
        <p className="dl-small mt-1">
          A quick look at what&apos;s in your inventory right now.
        </p>
        {recent.length === 0 && (
          <div className="dl-empty mt-4">
            No cars yet —{" "}
            <Link href="/dashboard/listings/new" className="dl-link">
              add your first one
            </Link>
            .
          </div>
        )}
        <div className="mt-4" style={{ borderTop: recent.length ? "1px solid var(--border)" : "none" }}>
          {recent.map((listing) => (
            <div
              key={listing.id}
              className="flex items-center justify-between gap-4 py-3"
              style={{ borderBottom: "1px solid var(--border)" }}
            >
              <div className="flex min-w-0 items-center gap-3">
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-semibold"
                  style={{ background: "var(--accent)", color: "var(--accent-text, #fff)" }}
                >
                  {listing.make.slice(0, 1)}
                  {listing.model.slice(0, 1)}
                </div>
                <p className="dl-body truncate" style={{ fontWeight: 500 }}>
                  {listing.year} {listing.make} {listing.model}
                </p>
              </div>
              <span
                className={`dl-pill shrink-0 ${
                  listing.status === "draft" ? "dl-pill--draft" : "dl-pill--live"
                }`}
              >
                {listing.status === "posted"
                  ? "Live"
                  : listing.status === "sold"
                    ? "Sold"
                    : "Draft"}
              </span>
            </div>
          ))}
        </div>
        <Link href="/dashboard/listings" className="dl-link mt-4 inline-flex items-center gap-1">
          View all listings
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="h-4 w-4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
