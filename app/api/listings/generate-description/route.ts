import { NextResponse } from "next/server";
import { getCurrentDealer } from "@/lib/db/dealer";
import {
  generateListingDescription,
  formatCurrency,
  formatMileage,
  type DescriptionInput,
} from "@/lib/description";

// Google AI Studio free tier (see .env.example). Overridable via
// GEMINI_MODEL in case Google renames/retires this one later without us
// needing a code change — check https://ai.google.dev/gemini-api/docs/models
// for the current fast/free-tier model if this starts 404ing.
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";
const GEMINI_TIMEOUT_MS = 10_000;

function buildPrompt(listing: DescriptionInput): string {
  const facts = [
    `Year: ${listing.year}`,
    `Make: ${listing.make}`,
    `Model: ${listing.model}`,
    `Price: ${formatCurrency(listing.price)}`,
    `Mileage: ${formatMileage(listing.mileage)}`,
  ];
  if (listing.bodyType) facts.push(`Body style: ${listing.bodyType}`);
  if (listing.cleanTitle) facts.push("Clean title: yes");
  if (listing.oneOwner) facts.push("One owner: yes");
  if (listing.stockNumber) facts.push(`Stock number: ${listing.stockNumber}`);
  if (listing.vin) facts.push(`VIN: ${String(listing.vin).toUpperCase()}`);
  if (listing.description) {
    facts.push(`Dealer's own notes — work these in, don't drop them: ${listing.description}`);
  }

  return [
    "Write a Facebook Marketplace vehicle listing description. Plain text only, no markdown, no emoji, no hashtags, 3-5 short paragraphs.",
    "Open with year/make/model and price. Mention mileage and any notable facts (clean title, one owner, body style) in a natural sentence, not a bullet list. Close with a short, low-pressure line inviting a message to schedule a test drive or ask questions.",
    "Keep price with no cents (e.g. $21,900) and mileage with a trailing \"mi\" (e.g. 48,210 mi), matching the facts below exactly. If a VIN or stock number is given, put it on its own line at the very end, labeled clearly (e.g. \"Stock #A-1042 · VIN 1HGCV1F34KA000000\").",
    "",
    "Vehicle facts:",
    facts.join("\n"),
  ].join("\n");
}

async function generateWithGemini(listing: DescriptionInput): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: buildPrompt(listing) }] }],
          generationConfig: { temperature: 0.6, maxOutputTokens: 400 },
        }),
        signal: AbortSignal.timeout(GEMINI_TIMEOUT_MS),
      },
    );
    if (!res.ok) return null; // rate-limited, bad key, model retired, etc. — caller falls back
    const data = await res.json();
    const parts = data?.candidates?.[0]?.content?.parts ?? [];
    const text = parts.map((p: { text?: string }) => p.text ?? "").join("");
    return text.trim() || null;
  } catch {
    return null; // network error or timeout — caller falls back
  }
}

export async function POST(request: Request) {
  // /api/listings(.*) is already behind Clerk's proxy.ts middleware, same as
  // every other listings route — this just gets us the dealer row, and
  // incidentally keeps the shared free-tier Gemini key from being hit by
  // anyone who isn't a signed-in dealer.
  await getCurrentDealer();

  const body = await request.json();
  const listing: DescriptionInput = {
    year: body.year,
    make: String(body.make ?? "").trim(),
    model: String(body.model ?? "").trim(),
    mileage: body.mileage,
    price: body.price,
    vin: body.vin ? String(body.vin).trim() : null,
    bodyType: body.bodyType ? String(body.bodyType).trim() : null,
    stockNumber: body.stockNumber ? String(body.stockNumber).trim() : null,
    cleanTitle: Boolean(body.cleanTitle),
    oneOwner: Boolean(body.oneOwner),
    description: body.description ? String(body.description) : null,
  };

  if (!listing.make || !listing.model || !Number.isFinite(Number(listing.year))) {
    return NextResponse.json(
      { error: "Year, make, and model are needed to generate a description." },
      { status: 400 },
    );
  }

  const aiText = await generateWithGemini(listing);
  if (aiText) {
    return NextResponse.json({ description: aiText, source: "ai" });
  }

  // No API key configured, Gemini's free tier rate-limited us, or the call
  // otherwise failed — the dealer still gets a solid description, just the
  // deterministic one instead of an AI-written one.
  return NextResponse.json({ description: generateListingDescription(listing), source: "template" });
}
