import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { and, asc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { listings, listingPhotos } from "@/lib/db/schema";
import { getCurrentDealer } from "@/lib/db/dealer";
import { ListingDetailForm } from "@/components/dashboard/ListingDetailForm";
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

return (
<div className="max-w-2xl">
<h1 className="dl-h1">{vehicleName(listing)}</h1>
<p className="dl-small mt-1">
Edit the details and photos, update its status, or remove it.
</p>

{/* Photos (viewer + reorder/upload) live in the form's first card. */}
<ListingDetailForm listing={listing} photos={photos.map((photo) => photo.url)} />
</div>
);
}
