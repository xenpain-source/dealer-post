import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { and, asc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { listings, listingPhotos } from "@/lib/db/schema";
import { getCurrentDealer } from "@/lib/db/dealer";
import { ListingDetailForm } from "@/components/dashboard/ListingDetailForm";

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
<h1 className="dl-h1">
{listing.year} {listing.make} {listing.model}
</h1>
<p className="dl-small mt-1">
Edit the details, update its status, or remove it.
</p>

{photos.length > 0 && (
<div className="mt-6 grid grid-cols-4 gap-2 sm:grid-cols-6">
{photos.map((photo) => (
<div
key={photo.id}
className="aspect-square overflow-hidden"
style={{
borderRadius: "var(--dl-radius-md)",
border: "1px solid var(--border)",
}}
>
{/* eslint-disable-next-line @next/next/no-img-element */}
<img
src={photo.url}
alt=""
className="h-full w-full object-cover"
/>
</div>
))}
</div>
)}

<ListingDetailForm listing={listing} />
</div>
);
}
