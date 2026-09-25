import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { listings } from "@/lib/db/schema";
import { getCurrentDealer } from "@/lib/db/dealer";

// Every query below filters on BOTH the listing id and the current dealer's
// id, so one dealer can never read or modify another dealer's listing even
// if they guess/share a listing id.

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { dealer } = await getCurrentDealer();
  const body = await request.json();

  const updates: Partial<typeof listings.$inferInsert> = {
    updatedAt: new Date(),
  };
  if (body.year !== undefined) updates.year = Number(body.year);
  if (body.mileage !== undefined) updates.mileage = Number(body.mileage);
  if (body.price !== undefined) updates.price = Number(body.price);
  if (body.make !== undefined) updates.make = String(body.make);
  if (body.model !== undefined) updates.model = String(body.model);
  if (body.description !== undefined)
    updates.description = String(body.description);
  if (body.status !== undefined) updates.status = body.status;

  const [updated] = await db
    .update(listings)
    .set(updates)
    .where(and(eq(listings.id, id), eq(listings.dealerId, dealer.id)))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }
  return NextResponse.json({ listing: updated });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { dealer } = await getCurrentDealer();

  const [deleted] = await db
    .delete(listings)
    .where(and(eq(listings.id, id), eq(listings.dealerId, dealer.id)))
    .returning({ id: listings.id });

  if (!deleted) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
