"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { platforms } from "@/lib/platforms";
import { PhotoUploader } from "@/components/dashboard/PhotoUploader";

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

      <fieldset className="dl-card">
        <legend className="dl-h4">Post to</legend>
        <p className="dl-small mt-1">
          Platform posting isn&apos;t connected yet — this saves the listing
          as a draft you can post manually for now.
        </p>
        <div className="mt-3 flex flex-col gap-2">
          {platforms.map((platform) => (
            <label
              key={platform.id}
              htmlFor={`platform-${platform.id}`}
              className="dl-channel"
              style={{ cursor: "not-allowed" }}
            >
              <input
                id={`platform-${platform.id}`}
                name="platforms"
                type="checkbox"
                disabled
                className="dl-check"
                style={{ width: 18, height: 18 }}
              />
              <span className="name">{platform.name}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {error && <div className="dl-alert dl-alert--danger">{error}</div>}

      <button type="submit" disabled={submitting} className="dl-btn dl-btn--primary w-fit">
        {submitting ? "Saving…" : "Save listing"}
      </button>
    </form>
  );
}
