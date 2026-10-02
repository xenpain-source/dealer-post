"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type Listing = {
id: string;
year: number;
make: string;
model: string;
mileage: number;
price: number;
description: string | null;
status: "draft" | "posted" | "sold";
};

const STATUSES: { value: Listing["status"]; label: string }[] = [
{ value: "draft", label: "Draft" },
{ value: "posted", label: "Posted" },
{ value: "sold", label: "Sold" },
];

export function ListingDetailForm({ listing }: { listing: Listing }) {
const router = useRouter();
const [status, setStatus] = useState<Listing["status"]>(listing.status);
const [saving, startSaving] = useTransition();
const [deleting, startDeleting] = useTransition();
const [error, setError] = useState<string | null>(null);
const [justSaved, setJustSaved] = useState(false);

function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
event.preventDefault();
setError(null);
setJustSaved(false);

const form = new FormData(event.currentTarget);
const body = {
year: form.get("year"),
make: form.get("make"),
model: form.get("model"),
mileage: String(form.get("mileage") ?? "").replace(/,/g, ""),
price: String(form.get("price") ?? "").replace(/[$,]/g, ""),
description: form.get("description"),
status,
};

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
setJustSaved(true);
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
<form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-6">
<div className="dl-card">
<h2 className="dl-h4">Status</h2>
<p className="dl-small mt-1">
Draft is only visible to you. Mark it Posted once it&apos;s live
somewhere, or Sold once it&apos;s gone.
</p>
<div className="mt-3 flex flex-wrap gap-2">
{STATUSES.map((s) => (
<button
key={s.value}
type="button"
onClick={() => setStatus(s.value)}
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

{error && <div className="dl-alert dl-alert--danger">{error}</div>}

<div className="flex items-center gap-3">
<button
type="submit"
disabled={busy}
className="dl-btn dl-btn--primary w-fit"
>
{saving ? "Saving…" : "Save changes"}
</button>
{justSaved && !saving && <span className="dl-small">Saved.</span>}
<button
type="button"
onClick={handleDelete}
disabled={busy}
className="dl-btn dl-btn--ghost w-fit"
style={{ color: "var(--danger-fg)", marginLeft: "auto" }}
>
{deleting ? "Deleting…" : "Delete listing"}
</button>
</div>
</form>
);
}
