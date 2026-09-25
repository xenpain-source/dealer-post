import { NextResponse } from "next/server";
import { eq, desc } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { listings, listingPhotos } from "@/lib/db/schema";
import { getCurrentDealer } from "@/lib/db/dealer";

export async function GET() {
  const { dealer } = await getCurrentDealer();

  const rows = await db
    .select()
    .from(listings)
    .where(eq(listings.dealerId, dealer.id))
    .orderBy(desc(listings.createdAt));

  return NextResponse.json({ listings: rows });
}

export async function POST(request: Request) {
  const { dealer } = await getCurrentDealer();
  const body = await request.json();

  const year = Number(body.year);
  const mileage = Number(body.mileage);
  const price = Number(body.price);
  const make = String(body.make ?? "").trim();
  const model = String(body.model ?? "").trim();

  if (!make || !model || !Number.isFinite(year) || !Number.isFinite(mileage) || !Number.isFinite(price)) {
    return NextResponse.json(
      { error: "Year, make, model, mileage, and price are all required." },
      { status: 400 },
    );
  }

  const [created] = await db
    .insert(listings)
    .values({
      dealerId: dealer.id,
      year,
      make,
      model,
      mileage,
      price,
      description: String(body.description ?? ""),
      status: "draft",
    })
    .returning();

  const photoUrls: string[] = Array.isArray(body.photoUrls)
    ? body.photoUrls.filter((u: unknown) => typeof u === "string")
    : [];

  if (photoUrls.length > 0) {
    await db.insert(listingPhotos).values(
      photoUrls.map((url, index) => ({
        listingId: created.id,
        url,
        sortOrder: index,
      })),
    );
  }

  return NextResponse.json({ listing: created }, { status: 201 });
}
