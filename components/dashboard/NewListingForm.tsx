"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { platforms } from "@/lib/platforms";
import { PhotoUploader } from "@/components/dashboard/PhotoUploader";

const inputClass =
  "mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm placeholder:text-zinc-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:outline-none disabled:bg-zinc-50 disabled:text-zinc-400";

const labelClass = "block text-sm font-medium text-zinc-700";

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
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <PhotoUploader onUploaded={setPhotoUrls} />
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-zinc-900">
          Vehicle details
        </h2>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="year" className={labelClass}>
              Year
            </label>
            <input
              id="year"
              name="year"
              type="number"
              required
              placeholder="2018"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="make" className={labelClass}>
              Make
            </label>
            <input
              id="make"
              name="make"
              required
              placeholder="Honda"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="model" className={labelClass}>
              Model
            </label>
            <input
              id="model"
              name="model"
              required
              placeholder="Civic"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="mileage" className={labelClass}>
              Mileage
            </label>
            <input
              id="mileage"
              name="mileage"
              required
              inputMode="numeric"
              placeholder="52,000"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="price" className={labelClass}>
              Price
            </label>
            <input
              id="price"
              name="price"
              required
              inputMode="numeric"
              placeholder="14,500"
              className={inputClass}
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <label htmlFor="description" className={labelClass}>
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          placeholder="Clean title, one owner, well maintained..."
          className={inputClass}
        />
      </div>

      <fieldset className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <legend className="text-sm font-semibold text-zinc-900">
          Post to
        </legend>
        <p className="mt-1 text-xs text-zinc-500">
          Platform posting isn&apos;t connected yet — this saves the listing
          as a draft you can post manually for now.
        </p>
        <div className="mt-3 flex flex-col gap-2">
          {platforms.map((platform) => (
            <label
              key={platform.id}
              htmlFor={`platform-${platform.id}`}
              className="flex cursor-not-allowed items-center gap-3 rounded-xl border border-zinc-200 p-3 text-sm text-zinc-600"
            >
              <input
                id={`platform-${platform.id}`}
                name="platforms"
                type="checkbox"
                disabled
                className="h-4 w-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-zinc-900 text-xs font-semibold text-white">
                {platform.name.charAt(0)}
              </span>
              {platform.name}
            </label>
          ))}
        </div>
      </fieldset>

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-fit rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:opacity-50"
      >
        {submitting ? "Saving…" : "Save listing"}
      </button>
    </form>
  );
}
