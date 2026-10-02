import Link from "next/link";
import type { Metadata } from "next";
import { asc, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { listings, listingPhotos } from "@/lib/db/schema";
import { getCurrentDealer } from "@/lib/db/dealer";
import { ListingRowActions } from "@/components/dashboard/ListingRowActions";

export const metadata: Metadata = {
  title: "Listings",
};

export default async function ListingsPage() {
  const { dealer } = await getCurrentDealer();
  const rows = await db
    .select()
    .from(listings)
    .where(eq(listings.dealerId, dealer.id))
    .orderBy(desc(listings.createdAt));

  // One extra query for the whole page rather than one per row: grab every
  // photo for these listings, then keep only the first (lowest sortOrder)
  // per listing to use as its thumbnail.
  const coverPhotoByListing = new Map<string, string>();
  if (rows.length > 0) {
    const photos = await db
      .select({ listingId: listingPhotos.listingId, url: listingPhotos.url })
      .from(listingPhotos)
      .where(
        inArray(
          listingPhotos.listingId,
          rows.map((listing) => listing.id),
        ),
      )
      .orderBy(asc(listingPhotos.sortOrder));
    for (const photo of photos) {
      if (!coverPhotoByListing.has(photo.listingId)) {
        coverPhotoByListing.set(photo.listingId, photo.url);
      }
    }
  }

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="dl-h1">Listings</h1>
          <p className="dl-small mt-1">
            {rows.length} car{rows.length === 1 ? "" : "s"} in your inventory.
          </p>
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

      {rows.length === 0 ? (
        <div className="dl-empty mt-6">
          <b>No cars in your inventory yet.</b>
          <Link href="/dashboard/listings/new" className="dl-link">
            Add your first car
          </Link>
        </div>
      ) : (
        <div className="dl-table-wrap mt-6">
          <table className="dl-table">
            <thead>
              <tr>
                <th>Vehicle</th>
                <th>Price</th>
                <th>Mileage</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((listing) => (
                <tr key={listing.id}>
                  <td>
                    <Link
                      href={`/dashboard/listings/${listing.id}`}
                      className="veh"
                      style={{ textDecoration: "none", color: "inherit" }}
                    >
                      {coverPhotoByListing.has(listing.id) ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={coverPhotoByListing.get(listing.id)}
                          alt=""
                          className="thumb"
                          style={{ objectFit: "cover" }}
                        />
                      ) : (
                        <div className="thumb" />
                      )}
                      {listing.year} {listing.make} {listing.model}
                    </Link>
                  </td>
                  <td className="num">${listing.price.toLocaleString()}</td>
                  <td className="num">{listing.mileage.toLocaleString()} mi</td>
                  <td>
                    <span
                      className={`dl-pill ${
                        listing.status === "draft" ? "dl-pill--draft" : "dl-pill--live"
                      }`}
                    >
                      {listing.status === "posted"
                        ? "Posted"
                        : listing.status === "sold"
                          ? "Sold"
                          : "Draft"}
                    </span>
                  </td>
                  <td>
                    <ListingRowActions listingId={listing.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
