"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ListingRowActions } from "./ListingRowActions";
import { vehicleName } from "@/lib/lot-stats";

type ListingStatus = "draft" | "posted" | "sold";

type ListingRow = {
  id: string;
  year: number;
  make: string;
  model: string;
  price: number;
  mileage: number;
  status: ListingStatus;
  vin: string | null;
  stockNumber: string | null;
  createdAt: string;
};

type StatusFilter = "all" | ListingStatus;

const STATUS_TABS: { key: StatusFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "posted", label: "Live" },
  { key: "draft", label: "Draft" },
  { key: "sold", label: "Sold" },
];

function daysListed(createdAt: string) {
  const ms = Date.now() - new Date(createdAt).getTime();
  return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)));
}

export function ListingsTable({
  listings,
  coverPhotoByListing,
}: {
  listings: ListingRow[];
  coverPhotoByListing: Record<string, string>;
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");

  const counts = useMemo(() => {
    const c: Record<StatusFilter, number> = { all: listings.length, draft: 0, posted: 0, sold: 0 };
    for (const listing of listings) c[listing.status]++;
    return c;
  }, [listings]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return listings.filter((listing) => {
      if (status !== "all" && listing.status !== status) return false;
      if (!q) return true;
      const haystack = [
        listing.year.toString(),
        listing.make,
        listing.model,
        listing.vin ?? "",
        listing.stockNumber ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [listings, query, status]);

  return (
    <div className="mt-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="dl-tabs" role="tablist">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={status === tab.key}
              className="dl-tab"
              onClick={() => setStatus(tab.key)}
            >
              {tab.label}
              <span className="count">{counts[tab.key]}</span>
            </button>
          ))}
        </div>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search make, model, VIN, stock #…"
          className="dl-input w-full sm:w-64"
          aria-label="Search listings"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="dl-empty mt-4">
          <b>No cars match.</b>
          {query || status !== "all" ? (
            <button
              type="button"
              className="dl-link"
              onClick={() => {
                setQuery("");
                setStatus("all");
              }}
            >
              Clear filters
            </button>
          ) : null}
        </div>
      ) : (
        <div className="dl-table-wrap mt-4">
          <table className="dl-table">
            <thead>
              <tr>
                <th>Vehicle</th>
                <th>Price</th>
                <th>Mileage</th>
                <th>Status</th>
                <th>Days listed</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((listing) => (
                <tr key={listing.id}>
                  <td>
                    <Link
                      href={`/dashboard/listings/${listing.id}`}
                      className="veh"
                      style={{ textDecoration: "none", color: "inherit" }}
                    >
                      {coverPhotoByListing[listing.id] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={coverPhotoByListing[listing.id]}
                          alt=""
                          className="thumb"
                          style={{ objectFit: "cover" }}
                        />
                      ) : (
                        <div className="thumb" />
                      )}
                      {vehicleName(listing)}
                    </Link>
                  </td>
                  <td className="num">${listing.price.toLocaleString()}</td>
                  <td className="num">{listing.mileage.toLocaleString()} mi</td>
                  <td>
                    <span
                      className={`dl-pill ${
                        listing.status === "draft"
                          ? "dl-pill--draft"
                          : listing.status === "sold"
                            ? "dl-pill--sold"
                            : "dl-pill--live"
                      }`}
                    >
                      {listing.status === "posted"
                        ? "Live"
                        : listing.status === "sold"
                          ? "Sold"
                          : "Draft"}
                    </span>
                  </td>
                  <td className="num">{daysListed(listing.createdAt)}</td>
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
