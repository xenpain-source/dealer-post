import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { listings, listingPhotos } from "@/lib/db/schema";
import { getCurrentDealer } from "@/lib/db/dealer";
import { R2_PUBLIC_URL } from "@/lib/r2";

const MAX_PHOTOS = 30;

// Replaces a listing's photos with the given ordered list: reorders, removes
// and adds in one go. The first URL becomes the cover (sortOrder 0).
//
// Only URLs the listing already has, or fresh uploads to our own photo
// bucket, are accepted, so this can't be used to point a listing at an
// arbitrary image elsewhere on the web.
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { dealer } = await getCurrentDealer();
  const body = await request.json().catch(() => null);

  if (!Array.isArray(body?.urls) || !body.urls.every((u: unknown) => typeof u === "string")) {
    return NextResponse.json({ error: "Send the photos as a list of URLs." }, { status: 400 });
  }
  const urls: string[] = [...new Set<string>(body.urls)];
  if (urls.length > MAX_PHOTOS) {
    return NextResponse.json({ error: `A listing can have up to ${MAX_PHOTOS} photos.` }, { status: 400 });
  }

  const [listing] = await db
    .select({ id: listings.id })
    .from(listings)
    .where(and(eq(listings.id, id), eq(listings.dealerId, dealer.id)));
  if (!listing) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }

  const existing = await db
    .select({ url: listingPhotos.url })
    .from(listingPhotos)
    .where(eq(listingPhotos.listingId, id));
  const known = new Set(existing.map((p) => p.url));
  const bucketPrefix = `${R2_PUBLIC_URL.replace(/\/$/, "")}/`;
  const invalid = urls.find((u) => !known.has(u) && !u.startsWith(bucketPrefix));
  if (invalid) {
    return NextResponse.json({ error: "One of the photos isn't from this listing or our uploads." }, { status: 400 });
  }

  await db.transaction(async (tx) => {
    await tx.delete(listingPhotos).where(eq(listingPhotos.listingId, id));
    if (urls.length > 0) {
      await tx.insert(listingPhotos).values(urls.map((url, index) => ({ listingId: id, url, sortOrder: index })));
    }
    await tx.update(listings).set({ updatedAt: new Date() }).where(eq(listings.id, id));
  });

  return NextResponse.json({ photos: urls });
}
