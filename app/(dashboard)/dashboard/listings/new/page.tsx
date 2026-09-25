import type { Metadata } from "next";
import { platforms } from "@/lib/platforms";

export const metadata: Metadata = {
  title: "Add a car",
};

const inputClass =
  "mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm placeholder:text-zinc-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:outline-none disabled:bg-zinc-50 disabled:text-zinc-400";

const labelClass = "block text-sm font-medium text-zinc-700";

export default function NewListingPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold tracking-tight">Add a car</h1>
      <p className="mt-1 text-sm text-zinc-600">
        Placeholder form — not wired up to storage or posting yet.
      </p>

      <form className="mt-8 flex flex-col gap-6">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <label htmlFor="photos" className={labelClass}>
            Photos
          </label>
          <div
            id="photos"
            className="mt-3 flex h-36 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-zinc-300 text-sm text-zinc-400"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-6 w-6"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 16.5V18a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-1.5M16 8l-4-4-4 4M12 4v12" />
            </svg>
            Drag photos here or tap to upload
          </div>
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
                disabled
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
                disabled
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
                disabled
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
                disabled
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
                disabled
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
            disabled
            rows={4}
            placeholder="Clean title, one owner, well maintained..."
            className={inputClass}
          />
        </div>

        <fieldset className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <legend className="text-sm font-semibold text-zinc-900">
            Post to
          </legend>
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

        <button
          type="submit"
          disabled
          className="w-fit rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white opacity-50 shadow-sm"
        >
          Post listing
        </button>
      </form>
    </div>
  );
}
