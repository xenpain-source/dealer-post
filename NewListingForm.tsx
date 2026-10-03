"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { platforms } from "@/lib/platforms";
import { PhotoUploader } from "@/components/dashboard/PhotoUploader";
import { DlLoader } from "@/components/dashboard/DlLoader";

export function NewListingForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    const form = new FormData(event.currentTarget);
    const body = {
      year: form.get("year"),
      make: form.get("make"),
      model: form.get("model"),
      mileage: String(form.get("mileage") ?? "").replace(/,/g, ""),
      price: String(form.get("price") ?? "").replace(/[$,]/g, ""),
      vin: form.get("vin"),
      bodyType: form.get("bodyType"),
      stockNumber: form.get("stockNumber"),
      cleanTitle: form.get("cleanTitle") === "on",
      oneOwner: form.get("oneOwner") === "on",
      description: form.get("description"),
      photoUrls,
    };

    try {
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Couldn't save this listing — try again.");
        setSubmitting(false);
        return;
      }
      router.push("/dashboard/listings");
      router.refresh();
    } catch {
      setError("Couldn't reach the server — check your connection and try again.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-6">
      <div className="dl-card">
        <PhotoUploader onUploaded={setPhotoUrls} />
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
              placeholder="2018"
              className="dl-input dl-input--data"
            />
          </div>
          <div className="dl-field">
            <label htmlFor="make" className="dl-label">
              Make
            </label>
            <input id="make" name="make" required placeholder="Honda" className="dl-input" />
          </div>
          <div className="dl-field">
            <label htmlFor="model" className="dl-label">
              Model
            </label>
            <input id="model" name="model" required placeholder="Civic" className="dl-input" />
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
                placeholder="52,000"
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
                placeholder="14,500"
                className="dl-input dl-input--data"
              />
            </div>
          </div>
          <div className="dl-field">
            <label htmlFor="bodyType" className="dl-label">
              Body type
            </label>
            <select id="bodyType" name="bodyType" className="dl-select" defaultValue="">
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
              placeholder="1HGCV1F59KA012345"
              maxLength={17}
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
              placeholder="A-1042"
              className="dl-input dl-input--data"
            />
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-6">
          <label className="dl-check">
            <input id="cleanTitle" name="cleanTitle" type="checkbox" />
            Clean title
          </label>
          <label className="dl-check">
            <input id="oneOwner" name="oneOwner" type="checkbox" />
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
          placeholder="Clean title, one owner, well maintained..."
          className="dl-textarea"
        />
      </div>

      <div className="dl-card">
        <h2 className="dl-h4">Post to</h2>
        <p className="dl-small mt-1">
          This saves the listing as a draft first. Once it&apos;s saved,
          open it from the Listings page to post it — each channel below
          shows up there with its own status.
        </p>
        <ul className="mt-3 flex flex-col gap-1 dl-small">
          {platforms.map((platform) => (
            <li key={platform.id}>
              <b>{platform.name}:</b> {platform.note}
            </li>
          ))}
        </ul>
      </div>

      {error && <div className="dl-alert dl-alert--danger">{error}</div>}

      <button type="submit" disabled={submitting} className="dl-btn dl-btn--primary w-fit">
        {submitting && <DlLoader />}
        {submitting ? "Saving…" : "Save listing"}
      </button>
    </form>
  );
}
