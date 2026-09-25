import Link from "next/link";
import type { Metadata } from "next";
import { sampleListings } from "@/lib/listings";

export const metadata: Metadata = {
  title: "Overview",
};

export default function DashboardOverview() {
  const posted = sampleListings.filter((l) => l.status === "posted").length;
  const drafts = sampleListings.filter((l) => l.status === "draft").length;

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
      <p className="mt-1 text-sm text-zinc-600">
        Placeholder numbers — will reflect real inventory once this is
        connected to a backend.
      </p>

      <div className="mt-8 grid max-w-xl gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-zinc-200 p-5">
          <div className="text-2xl font-semibold">
            {sampleListings.length}
          </div>
          <div className="text-sm text-zinc-600">Total cars</div>
        </div>
        <div className="rounded-lg border border-zinc-200 p-5">
          <div className="text-2xl font-semibold">{posted}</div>
          <div className="text-sm text-zinc-600">Posted</div>
        </div>
        <div className="rounded-lg border border-zinc-200 p-5">
          <div className="text-2xl font-semibold">{drafts}</div>
          <div className="text-sm text-zinc-600">Drafts</div>
        </div>
      </div>

      <Link
        href="/dashboard/listings/new"
        className="mt-8 inline-block rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
      >
        + Add a car
      </Link>
    </div>
  );
}
