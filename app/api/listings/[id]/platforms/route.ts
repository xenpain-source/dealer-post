import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { listings, platformConnections } from "@/lib/db/schema";
import { getCurrentDealer } from "@/lib/db/dealer";

// Read-only status check for the per-platform connection pills (e.g. "Live
// on Facebook"). Polled by the dashboard while a post is in flight, and
// fetched once on page load so the pill survives a refresh.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { dealer } = await getCurrentDealer();

  // Confirm the listing belongs to this dealer before returning anything —
  // same scoping rule as every other listing route.
  const [listing] = await db
    .select({ id: listings.id })
    .from(listings)
    .where(and(eq(listings.id, id), eq(listings.dealerId, dealer.id)));

  if (!listing) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }

  const rows = await db
    .select()
    .from(platformConnections)
    .where(eq(platformConnections.listingId, id));

  const now = Date.now();
  const connections = rows.map((row) => {
    // A "pending" row whose one-time token has expired means the dealer
    // never finished on Facebook (or closed the tab) — treat it as if
    // nothing was ever started so the button offers a clean retry instead
    // of showing "Posting…" forever.
    const expired =
      row.status === "pending" &&
      (!row.tokenExpiresAt || row.tokenExpiresAt.getTime() < now);
    return {
      platform: row.platform,
      status: expired ? "idle" : row.status,
      externalUrl: row.externalUrl,
    };
  });

  return NextResponse.json({ connections });
}
