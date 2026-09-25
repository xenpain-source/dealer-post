import Link from "next/link";
import { sampleListings } from "@/lib/listings";

export default function ListingsPage() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Listings</h1>
        <Link
          href="/dashboard/listings/new"
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
        >
          + Add a car
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border border-zinc-200">
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
                <td className="px-4 py-3">
                  {listing.year} {listing.make} {listing.model}
                </td>
                <td className="px-4 py-3">
                  ${listing.price.toLocaleString()}
                </td>
                <td className="px-4 py-3">
                  {listing.mileage.toLocaleString()} mi
                </td>
                <td className="px-4 py-3">
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
                <td className="px-4 py-3 text-zinc-600">
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
  );
}
