import Link from "next/link";
import type { Metadata } from "next";
import { sampleListings } from "@/lib/listings";

export const metadata: Metadata = {
  title: "Listings",
};

export default function ListingsPage() {
  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Listings</h1>
        <Link
          href="/dashboard/listings/new"
          className="w-fit rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
        >
          + Add a car
        </Link>
      </div>

      <div className="mt-6 rounded-lg border border-zinc-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 text-zinc-600">
              <tr>
                <th className="px-4 py-3 font-medium">Vehicle</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Mileage</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Platforms</th>
              </tr>
            </thead>
            <tbody>
              {sampleListings.map((listing) => (
                <tr key={listing.id} className="border-t border-zinc-200">
                  <td className="px-4 py-3 whitespace-nowrap">
                    {listing.year} {listing.make} {listing.model}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    ${listing.price.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {listing.mileage.toLocaleString()} mi
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        listing.status === "posted"
                          ? "bg-green-100 text-green-700"
                          : "bg-zinc-100 text-zinc-600"
                      }`}
                    >
                      {listing.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-zinc-600">
                    {listing.platforms.length > 0
                      ? listing.platforms.join(", ")
                      : "—"}
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
