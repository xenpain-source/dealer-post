import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { and, asc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { listings, listingPhotos } from "@/lib/db/schema";
import { getCurrentDealer } from "@/lib/db/dealer";
import { ListingDetailForm } from "@/components/dashboard/ListingDetailForm";
import { PhotoCarousel } from "@/components/dashboard/PhotoCarousel";
import { vehicleName } from "@/lib/lot-stats";

export const metadata: Metadata = {
title: "Edit listing",
};

export default async function ListingDetailPage({
params,
}: {
params: Promise<{ id: string }>;
}) {
const { id } = await params;
const { dealer } = await getCurrentDealer();

// Scoped to the current dealer, same as the API routes - a dealer can
// never open another dealer's listing even by guessing its id.
const [listing] = await db
.select()
.from(listings)
.where(and(eq(listings.id, id), eq(listings.dealerId, dealer.id)));

if (!listing) notFound();

const photos = await db
.select()
.from(listingPhotos)
.where(eq(listingPhotos.listingId, id))
.orderBy(asc(listingPhotos.sortOrder));

const name = vehicleName(listing);

return (
<div className="max-w-2xl">
<h1 className="dl-h1">{name}</h1>
<p className="dl-small mt-1">
Edit the details, update its status, or remove it.
</p>

{photos.length > 0 && (
<div className="mt-6">
<PhotoCarousel
photos={photos.map((photo) => photo.url)}
label={name}
thumbnails
frameStyle={{ borderRadius: "var(--dl-radius-lg)", border: "1px solid var(--border)" }}
/>
</div>
)}

<ListingDetailForm listing={listing} photos={photos.map((photo) => photo.url)} />
</div>
);
}
