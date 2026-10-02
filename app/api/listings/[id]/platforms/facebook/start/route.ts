import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { listings, platformConnections } from "@/lib/db/schema";
import { getCurrentDealer } from "@/lib/db/dealer";

const TOKEN_TTL_MS = 20 * 60 * 1000; // 20 minutes — plenty of time to review and click Publish

// Called right when the dealer clicks "Post to Facebook Marketplace", before
// the listing is handed to the browser extension. Mints a one-time token the
// extension can later use to tell us the post went through, with no
// DealerLoft login available on that side (the callback comes from
// facebook.com, not this app).
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

  const token = randomUUID();
  const tokenExpiresAt = new Date(Date.now() + TOKEN_TTL_MS);

  const [existing] = await db
    .select({ id: platformConnections.id })
    .from(platformConnections)
    .where(
      and(
        eq(platformConnections.listingId, id),
        eq(platformConnections.platform, "facebook"),
      ),
    );

  if (existing) {
    await db
      .update(platformConnections)
      .set({ status: "pending", externalUrl: null, token, tokenExpiresAt })
      .where(eq(platformConnections.id, existing.id));
  } else {
    await db.insert(platformConnections).values({
      listingId: id,
      platform: "facebook",
      status: "pending",
      token,
      tokenExpiresAt,
    });
  }

  return NextResponse.json({ token, expiresAt: tokenExpiresAt.toISOString() });
}
