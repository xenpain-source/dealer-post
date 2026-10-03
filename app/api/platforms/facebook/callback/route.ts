import { NextResponse } from "next/server";
import { and, eq, gt } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { listings, platformConnections, postingHistory } from "@/lib/db/schema";

// Called by the DealerLoft Marketplace Assistant browser extension — from
// facebook.com, not from this app — once it sees the dealer's listing go
// live on Facebook (or the dealer confirms it manually from the extension's
// on-page banner). There's no DealerLoft login available on that side, so
// the one-time token minted by /api/listings/[id]/platforms/facebook/start
// is the only thing authorizing this write. Deliberately NOT behind
// getCurrentDealer()/Clerk — this route is meant to be reachable
// cross-origin from the extension's background worker.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const token = typeof body?.token === "string" ? body.token : null;
  const externalUrl =
    typeof body?.externalUrl === "string" ? body.externalUrl.slice(0, 2048) : null;

  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  const [connection] = await db
    .select()
    .from(platformConnections)
    .where(
      and(
        eq(platformConnections.token, token),
        gt(platformConnections.tokenExpiresAt, new Date()),
      ),
    );

  if (!connection) {
    // Expired, already used, or never existed — nothing to do. Not an error
    // the dealer needs to see; the extension just logs this to its console.
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 410 });
  }

  await db
    .update(platformConnections)
    .set({ status: "posted", externalUrl, token: null, tokenExpiresAt: null })
    .where(eq(platformConnections.id, connection.id));

  // Being on Marketplace is what "Live" means, so a draft flips to Live here
  // too. Only from draft — never un-sell a listing the dealer marked Sold.
  await db
    .update(listings)
    .set({ status: "posted" })
    .where(and(eq(listings.id, connection.listingId), eq(listings.status, "draft")));

  await db.insert(postingHistory).values({
    listingId: connection.listingId,
    platform: "facebook",
    action: "created",
    detail: externalUrl,
  });

  return NextResponse.json({ ok: true });
}
