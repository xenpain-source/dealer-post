import type { Metadata } from "next";
import { platforms } from "@/lib/platforms";

export const metadata: Metadata = {
  title: "Add a car",
};

export default function NewListingPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold tracking-tight">Add a car</h1>
      <p className="mt-1 text-sm text-zinc-600">
        Placeholder form — not wired up to storage or posting yet.
      </p>

      <form className="mt-8 flex flex-col gap-6">
        <div>
          <label
            htmlFor="photos"
            className="block text-sm font-medium text-zinc-700"
          >
            Photos
          </label>
          <div
            id="photos"
            className="mt-1 flex h-32 items-center justify-center rounded-md border border-dashed border-zinc-300 text-sm text-zinc-400"
          >
            Drag photos here or tap to upload
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="year"
              className="block text-sm font-medium text-zinc-700"
            >
              Year
            </label>
            <input
              id="year"
              name="year"
              disabled
              placeholder="2018"
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label
              htmlFor="make"
              className="block text-sm font-medium text-zinc-700"
            >
              Make
            </label>
            <input
              id="make"
              name="make"
              disabled
              placeholder="Honda"
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label
              htmlFor="model"
              className="block text-sm font-medium text-zinc-700"
            >
              Model
            </label>
            <input
              id="model"
              name="model"
              disabled
              placeholder="Civic"
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label
              htmlFor="mileage"
              className="block text-sm font-medium text-zinc-700"
            >
              Mileage
            </label>
            <input
              id="mileage"
              name="mileage"
              disabled
              placeholder="52,000"
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label
              htmlFor="price"
              className="block text-sm font-medium text-zinc-700"
            >
              Price
            </label>
            <input
              id="price"
              name="price"
              disabled
              placeholder="14,500"
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-zinc-700"
          >
            Description
          </label>
          <textarea
            id="description"
            name="description"
            disabled
            rows={4}
            placeholder="Clean title, one owner, well maintained..."
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
        </div>

        <fieldset>
          <legend className="block text-sm font-medium text-zinc-700">
            Post to
          </legend>
          <div className="mt-2 flex flex-col gap-2">
            {platforms.map((platform) => (
              <label
                key={platform.id}
                htmlFor={`platform-${platform.id}`}
                className="flex items-center gap-2 text-sm text-zinc-600"
              >
                <input
                  id={`platform-${platform.id}`}
                  name="platforms"
                  type="checkbox"
                  disabled
                />
                {platform.name}
              </label>
            ))}
          </div>
        </fieldset>

        <button
          type="submit"
          disabled
          className="w-fit rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white opacity-50"
        >
          Post listing
        </button>
      </form>
    </div>
  );
}
