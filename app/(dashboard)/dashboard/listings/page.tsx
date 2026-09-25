import Link from "next/link";
import type { Metadata } from "next";
import { sampleListings } from "@/lib/listings";
import { platforms } from "@/lib/platforms";

export const metadata: Metadata = {
  title: "Listings",
};

function platformName(id: string) {
  return platforms.find((p) => p.id === id)?.name ?? id;
}

export default function ListingsPage() {
  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Listings</h1>
          <p className="mt-1 text-sm text-zinc-600">
            {sampleListings.length} cars in your inventory.
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

      <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 text-xs font-medium tracking-wide text-zinc-500 uppercase">
              <tr>
                <th className="px-5 py-3 font-medium">Vehicle</th>
                <th className="px-5 py-3 font-medium">Price</th>
                <th className="px-5 py-3 font-medium">Mileage</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Platforms</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {sampleListings.map((listing) => (
                <tr
                  key={listing.id}
                  className="transition-colors hover:bg-zinc-50"
                >
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 text-xs font-semibold text-white">
                        {listing.make.slice(0, 1)}
                        {listing.model.slice(0, 1)}
                      </div>
                      <span className="font-medium text-zinc-900">
                        {listing.year} {listing.make} {listing.model}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 font-medium whitespace-nowrap text-zinc-900">
                    ${listing.price.toLocaleString()}
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap text-zinc-600">
                    {listing.mileage.toLocaleString()} mi
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                        listing.status === "posted"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          listing.status === "posted"
                            ? "bg-emerald-600"
                            : "bg-amber-600"
                        }`}
                      />
                      {listing.status === "posted" ? "Posted" : "Draft"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    {listing.platforms.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {listing.platforms.map((id) => (
                          <span
                            key={id}
                            className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600"
                          >
                            {platformName(id)}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-zinc-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
