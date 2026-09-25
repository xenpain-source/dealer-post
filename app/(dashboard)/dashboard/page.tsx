import Link from "next/link";
import type { Metadata } from "next";
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { listings } from "@/lib/db/schema";
import { getCurrentDealer } from "@/lib/db/dealer";

export const metadata: Metadata = {
  title: "Overview",
};

const stats = (posted: number, drafts: number, total: number) => [
  {
    label: "Total cars",
    value: total,
    icon: (
      <path
        d="M5 17h14M6 17a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm16 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z M3 17V9.6a1 1 0 0 1 .4-.8l3.2-2.4a2 2 0 0 1 1.2-.4h7.4a2 2 0 0 1 1.7 1l2.4 4 2.1.7a1 1 0 0 1 .6.9V17"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
    tone: "bg-indigo-50 text-indigo-600",
  },
  {
    label: "Posted",
    value: posted,
    icon: (
      <path
        d="m5 13 4 4L19 7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
    tone: "bg-emerald-50 text-emerald-600",
  },
  {
    label: "Drafts",
    value: drafts,
    icon: (
      <path
        d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
    tone: "bg-amber-50 text-amber-600",
  },
];

export default async function DashboardOverview() {
  const { dealer } = await getCurrentDealer();
  const rows = await db
    .select()
    .from(listings)
    .where(eq(listings.dealerId, dealer.id))
    .orderBy(desc(listings.createdAt));

  const posted = rows.filter((l) => l.status === "posted").length;
  const drafts = rows.filter((l) => l.status === "draft").length;
  const recent = rows.slice(0, 5);

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Your real inventory for {dealer.name}.
          </p>
        </div>
        <Link
          href="/dashboard/listings/new"
          className="inline-flex w-fit items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700"
        >
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

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {stats(posted, drafts, rows.length).map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
          >
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.tone}`}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-5 w-5"
                stroke="currentColor"
                strokeWidth="1.75"
              >
                {stat.icon}
              </svg>
            </div>
            <div className="mt-4 text-2xl font-semibold text-zinc-900">
              {stat.value}
            </div>
            <div className="text-sm text-zinc-600">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="font-medium text-zinc-900">Recent listings</h2>
        <p className="mt-1 text-sm text-zinc-600">
          A quick look at what&apos;s in your inventory right now.
        </p>
        {recent.length === 0 && (
          <p className="mt-4 rounded-xl border border-dashed border-zinc-200 p-6 text-center text-sm text-zinc-500">
            No cars yet —{" "}
            <Link href="/dashboard/listings/new" className="text-indigo-600 hover:text-indigo-700">
              add your first one
            </Link>
            .
          </p>
        )}
        <div className="mt-4 divide-y divide-zinc-100">
          {recent.map((listing) => (
            <div
              key={listing.id}
              className="flex items-center justify-between gap-4 py-3"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 text-xs font-semibold text-white">
                  {listing.make.slice(0, 1)}
                  {listing.model.slice(0, 1)}
                </div>
                <p className="truncate text-sm font-medium text-zinc-900">
                  {listing.year} {listing.make} {listing.model}
                </p>
              </div>
              <span
                className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                  listing.status === "posted"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-amber-100 text-amber-700"
                }`}
              >
                {listing.status === "posted" ? "Posted" : "Draft"}
              </span>
            </div>
          ))}
        </div>
        <Link
          href="/dashboard/listings"
          className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700"
        >
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
