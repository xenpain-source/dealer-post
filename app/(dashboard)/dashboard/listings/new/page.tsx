import { platforms } from "@/lib/platforms";

export default function NewListingPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold tracking-tight">Add a car</h1>
      <p className="mt-1 text-sm text-zinc-600">
        Placeholder form — not wired up to storage or posting yet.
      </p>

      <form className="mt-8 flex flex-col gap-6">
        <div>
          <label className="block text-sm font-medium text-zinc-700">
            Photos
          </label>
          <div className="mt-1 flex h-32 items-center justify-center rounded-md border border-dashed border-zinc-300 text-sm text-zinc-400">
            Drag photos here or tap to upload
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700">
              Year
            </label>
            <input
              disabled
              placeholder="2018"
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700">
              Make
            </label>
            <input
              disabled
              placeholder="Honda"
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700">
              Model
            </label>
            <input
              disabled
              placeholder="Civic"
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700">
              Mileage
            </label>
            <input
              disabled
              placeholder="52,000"
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700">
              Price
            </label>
            <input
              disabled
              placeholder="14,500"
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700">
            Description
          </label>
          <textarea
            disabled
            rows={4}
            placeholder="Clean title, one owner, well maintained..."
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <span className="block text-sm font-medium text-zinc-700">
            Post to
          </span>
          <div className="mt-2 flex flex-col gap-2">
            {platforms.map((platform) => (
              <label
                key={platform.id}
                className="flex items-center gap-2 text-sm text-zinc-600"
              >
                <input type="checkbox" disabled />
                {platform.name}
              </label>
            ))}
          </div>
        </div>

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
