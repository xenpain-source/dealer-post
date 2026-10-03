// Composes a Facebook Marketplace-ready description straight from a
// listing's own fields. Used two ways:
//   1. As the fallback when the AI call in /api/listings/generate-description
//      is unavailable, rate-limited, or fails outright — it's the floor
//      everyone gets, not just a dev-mode stub.
//   2. As the prompt source for that same AI call, so the model gets the
//      exact facts (and DealerLoft's own formatting rules) rather than
//      having to guess at them.
//
// No "server-only" here on purpose — this has no secrets and no DB access,
// so it can run equally well in the API route or directly in the browser
// (a client component's own last-resort fallback if the API call itself
// can't be reached at all, e.g. offline).

export type DescriptionInput = {
  year: number | string;
  make: string;
  model: string;
  mileage: number | string;
  price: number | string;
  vin?: string | null;
  bodyType?: string | null;
  stockNumber?: string | null;
  cleanTitle?: boolean;
  oneOwner?: boolean;
  description?: string | null;
};

function toNumber(value: number | string | undefined | null): number {
  if (typeof value === "number") return value;
  const cleaned = String(value ?? "").replace(/[^0-9.]/g, "");
  return cleaned ? Number(cleaned) : 0;
}

// DealerLoft's own content rules (claude/dealerloft-web-ui.md): price with
// no cents, mileage with a "mi" suffix, VIN uppercase.
export function formatCurrency(value: number | string): string {
  return `$${Math.round(toNumber(value)).toLocaleString("en-US")}`;
}

export function formatMileage(value: number | string): string {
  return `${Math.round(toNumber(value)).toLocaleString("en-US")} mi`;
}

function capitalize(text: string): string {
  return text.length ? text[0].toUpperCase() + text.slice(1) : text;
}

export function generateListingDescription(listing: DescriptionInput): string {
  const title = [listing.year, listing.make, listing.model].filter(Boolean).join(" ").trim();
  const headline = title ? `${title} — ${formatCurrency(listing.price)}` : formatCurrency(listing.price);

  const facts: string[] = [formatMileage(listing.mileage)];
  if (listing.bodyType) facts.push(listing.bodyType);
  if (listing.cleanTitle) facts.push("clean title");
  if (listing.oneOwner) facts.push("one owner");
  const factsLine = `${capitalize(facts.join(", "))}.`;

  const idParts: string[] = [];
  if (listing.stockNumber) idParts.push(`Stock #${listing.stockNumber}`);
  if (listing.vin) idParts.push(`VIN ${String(listing.vin).toUpperCase()}`);
  const idLine = idParts.join(" · ");

  const notes = (listing.description ?? "").trim();
  const closing = "Message us to schedule a test drive or ask any questions — this one won't last long.";

  return [headline, notes, factsLine, closing, idLine].filter(Boolean).join("\n\n");
}

// Pulls the fields generateListingDescription() needs straight off a form,
// using the same $/comma stripping the rest of the app already applies to
// mileage/price before sending them to the server.
export function readVehicleFieldsFromForm(form: HTMLFormElement): DescriptionInput {
  const data = new FormData(form);
  return {
    year: String(data.get("year") ?? ""),
    make: String(data.get("make") ?? ""),
    model: String(data.get("model") ?? ""),
    mileage: String(data.get("mileage") ?? "").replace(/,/g, ""),
    price: String(data.get("price") ?? "").replace(/[$,]/g, ""),
    vin: String(data.get("vin") ?? ""),
    bodyType: String(data.get("bodyType") ?? ""),
    stockNumber: String(data.get("stockNumber") ?? ""),
    cleanTitle: data.get("cleanTitle") === "on",
    oneOwner: data.get("oneOwner") === "on",
    description: String(data.get("description") ?? ""),
  };
}
