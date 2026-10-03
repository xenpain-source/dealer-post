"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { DlLoader } from "./DlLoader";
import { Toast } from "./Toast";
import { PostToMarketplaceButton } from "./PostToMarketplaceButton";

type Listing = {
id: string;
year: number;
make: string;
model: string;
mileage: number;
price: number;
vin: string | null;
bodyType: string | null;
stockNumber: string | null;
cleanTitle: boolean;
oneOwner: boolean;
description: string | null;
status: "draft" | "posted" | "sold";
};

const STATUSES: { value: Listing["status"]; label: string }[] = [
{ value: "draft", label: "Draft" },
{ value: "posted", label: "Live" },
{ value: "sold", label: "Sold" },
];

type AutosaveState = "idle" | "saving" | "saved" | "error";

function readBody(form: HTMLFormElement, status: Listing["status"]) {
const data = new FormData(form);
return {
year: data.get("year"),
make: data.get("make"),
model: data.get("model"),
mileage: String(data.get("mileage") ?? "").replace(/,/g, ""),
price: String(data.get("price") ?? "").replace(/[$,]/g, ""),
vin: data.get("vin"),
bodyType: data.get("bodyType"),
stockNumber: data.get("stockNumber"),
cleanTitle: data.get("cleanTitle") === "on",
oneOwner: data.get("oneOwner") === "on",
description: data.get("description"),
status,
};
}

export function ListingDetailForm({
listing,
photos = [],
}: {
listing: Listing;
photos?: string[];
}) {
const router = useRouter();
const formRef = useRef<HTMLFormElement>(null);
const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
const statusRef = useRef(listing.status);

const [status, setStatus] = useState<Listing["status"]>(listing.status);
const [saving, startSaving] = useTransition();
const [deleting, startDeleting] = useTransition();
const [error, setError] = useState<string | null>(null);
const [autosave, setAutosave] = useState<AutosaveState>("idle");
const [toast, setToast] = useState<string | null>(null);

useEffect(() => {
statusRef.current = status;
}, [status]);

// Clear the "Saved"/"error" indicator a couple seconds after it lands, so
// it doesn't sit there forever once the dealer moves on.
useEffect(() => {
if (autosave === "saved" || autosave === "error") {
const t = setTimeout(() => setAutosave("idle"), 2500);
return () => clearTimeout(t);
}
}, [autosave]);

useEffect(() => {
return () => {
if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
};
}, []);

async function runAutosave() {
const form = formRef.current;
if (!form) return;
setAutosave("saving");
try {
const res = await fetch(`/api/listings/${listing.id}`, {
method: "PATCH",
headers: { "Content-Type": "application/json" },
body: JSON.stringify(readBody(form, statusRef.current)),
});
setAutosave(res.ok ? "saved" : "error");
} catch {
setAutosave("error");
}
}

function scheduleAutosave() {
if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
autosaveTimer.current = setTimeout(runAutosave, 1500);
}

function handleFieldChange() {
setError(null);
scheduleAutosave();
}

function handleStatusChange(next: Listing["status"]) {
setStatus(next);
scheduleAutosave();
}

function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
event.preventDefault();
if (autosaveTimer.current) {
clearTimeout(autosaveTimer.current);
autosaveTimer.current = null;
}
setError(null);

const wasPosted = listing.status === "posted";
const body = readBody(event.currentTarget, status);

startSaving(async () => {
const res = await fetch(`/api/listings/${listing.id}`, {
method: "PATCH",
headers: { "Content-Type": "application/json" },
body: JSON.stringify(body),
});
if (!res.ok) {
setError("Couldn't save changes — try again.");
return;
}
setAutosave("saved");
setToast(status === "posted" && !wasPosted ? "Listing published." : "Changes saved.");
router.refresh();
});
}

function handleDelete() {
if (!confirm("Delete this listing? This can't be undone.")) return;
setError(null);
startDeleting(async () => {
const res = await fetch(`/api/listings/${listing.id}`, {
method: "DELETE",
});
if (!res.ok) {
setError("Couldn't delete — try again.");
return;
}
router.push("/dashboard/listings");
router.refresh();
});
}

const busy = saving || deleting;

return (
<>
<form
ref={formRef}
onSubmit={handleSubmit}
onChange={handleFieldChange}
className="mt-6 flex flex-col gap-6"
>
<div className="dl-card">
<h2 className="dl-h4">Status</h2>
<p className="dl-small mt-1">
Draft is only visible to you. Mark it Live once it&apos;s posted
somewhere, or Sold once it&apos;s gone.
</p>
<div className="mt-3 flex flex-wrap gap-2">
{STATUSES.map((s) => (
<button
key={s.value}
type="button"
onClick={() => handleStatusChange(s.value)}
className={`dl-pill ${
status === s.value ? "dl-pill--live" : "dl-pill--draft"
}`}
style={{
cursor: "pointer",
border: status === s.value ? "none" : "1px solid var(--border)",
}}
>
{s.label}
</button>
))}
</div>
</div>

<div className="dl-card">
<h2 className="dl-h4">Vehicle details</h2>
<div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
<div className="dl-field">
<label htmlFor="year" className="dl-label">
Year
</label>
<input
id="year"
name="year"
type="number"
required
defaultValue={listing.year}
className="dl-input dl-input--data"
/>
</div>
<div className="dl-field">
<label htmlFor="make" className="dl-label">
Make
</label>
<input
id="make"
name="make"
required
defaultValue={listing.make}
className="dl-input"
/>
</div>
<div className="dl-field">
<label htmlFor="model" className="dl-label">
Model
</label>
<input
id="model"
name="model"
required
defaultValue={listing.model}
className="dl-input"
/>
</div>
<div className="dl-field">
<label htmlFor="mileage" className="dl-label">
Mileage
</label>
<div className="dl-affix dl-affix--suffix">
<input
id="mileage"
name="mileage"
required
inputMode="numeric"
defaultValue={listing.mileage.toLocaleString()}
className="dl-input dl-input--data"
/>
<span className="suf">mi</span>
</div>
</div>
<div className="dl-field">
<label htmlFor="price" className="dl-label">
Price
</label>
<div className="dl-affix">
<span className="pre">$</span>
<input
id="price"
name="price"
required
inputMode="numeric"
defaultValue={listing.price.toLocaleString()}
className="dl-input dl-input--data"
/>
</div>
</div>
<div className="dl-field">
<label htmlFor="bodyType" className="dl-label">
Body type
</label>
<select
id="bodyType"
name="bodyType"
className="dl-select"
defaultValue={listing.bodyType ?? ""}
>
<option value="" disabled>
Select a body type
</option>
<option value="Sedan">Sedan</option>
<option value="SUV">SUV</option>
<option value="Truck">Truck</option>
<option value="Coupe">Coupe</option>
<option value="Other">Other</option>
</select>
</div>
<div className="dl-field">
<label htmlFor="vin" className="dl-label">
VIN <span className="opt">(optional)</span>
</label>
<input
id="vin"
name="vin"
maxLength={17}
defaultValue={listing.vin ?? ""}
className="dl-input dl-input--data"
style={{ textTransform: "uppercase" }}
/>
</div>
<div className="dl-field">
<label htmlFor="stockNumber" className="dl-label">
Stock number <span className="opt">(optional)</span>
</label>
<input
id="stockNumber"
name="stockNumber"
defaultValue={listing.stockNumber ?? ""}
className="dl-input dl-input--data"
/>
</div>
</div>
<div className="mt-4 flex flex-wrap gap-6">
<label className="dl-check">
<input id="cleanTitle" name="cleanTitle" type="checkbox" defaultChecked={listing.cleanTitle} />
Clean title
</label>
<label className="dl-check">
<input id="oneOwner" name="oneOwner" type="checkbox" defaultChecked={listing.oneOwner} />
One owner
</label>
</div>
</div>

<div className="dl-card dl-field">
<label htmlFor="description" className="dl-label">
Description
</label>
<textarea
id="description"
name="description"
rows={4}
defaultValue={listing.description ?? ""}
className="dl-textarea"
/>
</div>

{listing.status !== "sold" && (
<PostToMarketplaceButton listingId={listing.id} listing={listing} photoUrls={photos} />
)}

{error && <div className="dl-alert dl-alert--danger">{error}</div>}

<div className="flex items-center gap-3">
<button
type="submit"
disabled={busy}
className="dl-btn dl-btn--primary w-fit"
>
{saving && <DlLoader />}
{saving ? "Saving…" : "Save changes"}
</button>
<span className="dl-small flex items-center gap-1" aria-live="polite">
{!saving && autosave === "saving" && (
<>
<DlLoader />
Saving…
</>
)}
{!saving && autosave === "saved" && "All changes saved"}
{!saving && autosave === "error" && "Couldn't autosave — try Save changes"}
</span>
<button
type="button"
onClick={handleDelete}
disabled={busy}
className="dl-btn dl-btn--ghost w-fit"
style={{ color: "var(--danger-fg)", marginLeft: "auto" }}
>
{deleting && <DlLoader />}
{deleting ? "Deleting…" : "Delete listing"}
</button>
</div>
</form>
{toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
</>
);
}
