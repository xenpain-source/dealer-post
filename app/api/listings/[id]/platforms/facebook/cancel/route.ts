import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { listings, platformConnections } from "@/lib/db/schema";
import { getCurrentDealer } from "@/lib/db/dealer";

// Called when the dealer abandons a post before publishing — they closed the
// Facebook tab (the extension notices and tells the page) or clicked Cancel.
// Clearing the one-time token is all it takes: the status route already
// reports a pending row with no live token as "idle", and a late callback
// from the extension with the old token is rejected.
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { dealer } = await getCurrentDealer();

  const [listing] = await db
    .select({ id: listings.id })
    .from(listings)
    .where(and(eq(listings.id, id), eq(listings.dealerId, dealer.id)));

  if (!listing) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }

  // Only touch an in-flight post — never undo one that already went live.
  await db
    .update(platformConnections)
    .set({ token: null, tokenExpiresAt: null })
    .where(
      and(
        eq(platformConnections.listingId, id),
        eq(platformConnections.platform, "facebook"),
        eq(platformConnections.status, "pending"),
      ),
    );

  return NextResponse.json({ ok: true });
}
