import Link from "next/link";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { platforms } from "@/lib/platforms";

const steps = [
  {
    step: "1",
    title: "Add a car",
    body: "Snap photos on your phone and fill in year, make, model, mileage and price.",
    icon: (
      <path
        d="M4 8.5A1.5 1.5 0 0 1 5.5 7h1.6a1 1 0 0 0 .8-.4l1-1.3a1 1 0 0 1 .8-.4h4.6a1 1 0 0 1 .8.4l1 1.3a1 1 0 0 0 .8.4h1.6A1.5 1.5 0 0 1 20 8.5v8a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 16.5v-8Z M12 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
        strokeLinejoin="round"
      />
    ),
  },
  {
    step: "2",
    title: "Pick where it goes",
    body: "Choose which platforms this listing should appear on.",
    icon: (
      <path
        d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  {
    step: "3",
    title: "Publish once",
    body: "Your listing goes out everywhere you picked, without retyping it each time.",
    icon: (
      <path
        d="m3 11 18-8-8 18-2.5-7.5L3 11Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
];

const statusStyles: Record<string, string> = {
  live: "bg-emerald-100 text-emerald-700",
  "in-progress": "bg-amber-100 text-amber-700",
  planned: "bg-zinc-100 text-zinc-600",
};

const statusLabels: Record<string, string> = {
  live: "Live",
  "in-progress": "In progress",
  planned: "Planned",
};

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 -top-40 -z-10 flex justify-center"
          >
            <div className="h-[32rem] w-[64rem] rounded-full bg-gradient-to-b from-indigo-100 via-indigo-50 to-transparent blur-3xl" />
          </div>

          <div className="mx-auto max-w-6xl px-6 pt-20 pb-24 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
              <span className="flex h-1.5 w-1.5 rounded-full bg-indigo-600" />
              Built for independent used car dealers
            </div>

            <h1 className="mx-auto mt-6 max-w-2xl text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
              Post your inventory{" "}
              <span className="bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">
                everywhere
              </span>
              , from one place.
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg text-zinc-600">
              Take a few photos, fill in the details once, and get your
              listings out to buyers across the platforms they&apos;re
              already browsing.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
              <Link
                href="/login"
                className="w-full rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm shadow-indigo-200 transition-colors hover:bg-indigo-700 sm:w-auto"
              >
                Get started
              </Link>
              <Link
                href="#how-it-works"
                className="w-full rounded-full border border-zinc-300 bg-white px-6 py-3 text-sm font-semibold text-zinc-700 transition-colors hover:border-zinc-400 hover:text-zinc-900 sm:w-auto"
              >
                See how it works
              </Link>
            </div>

            {/* Product preview mock */}
            <div className="mx-auto mt-16 max-w-3xl">
              <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl shadow-zinc-200/60">
                <div className="flex items-center gap-1.5 border-b border-zinc-200 bg-zinc-50 px-4 py-3">
                  <span className="h-2.5 w-2.5 rounded-full bg-zinc-300" />
                  <span className="h-2.5 w-2.5 rounded-full bg-zinc-300" />
                  <span className="h-2.5 w-2.5 rounded-full bg-zinc-300" />
                  <span className="ml-3 text-xs text-zinc-400">
                    dealer-post.app/dashboard/listings
                  </span>
                </div>
                <div className="space-y-3 p-5 text-left">
                  {[
                    {
                      name: "2018 Honda Civic",
                      price: "$14,500",
                      status: "Posted",
                      tone: "emerald",
                    },
                    {
                      name: "2016 Toyota Camry",
                      price: "$12,900",
                      status: "Posted",
                      tone: "emerald",
                    },
                    {
                      name: "2020 Ford Escape",
                      price: "$19,800",
                      status: "Draft",
                      tone: "amber",
                    },
                  ].map((row) => (
                    <div
                      key={row.name}
                      className="flex items-center gap-4 rounded-xl border border-zinc-100 p-3"
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 text-white">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          className="h-5 w-5"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M5 17h14M6 17a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm16 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z" />
                          <path d="M3 17V9.6a1 1 0 0 1 .4-.8l3.2-2.4a2 2 0 0 1 1.2-.4h7.4a2 2 0 0 1 1.7 1l2.4 4 2.1.7a1 1 0 0 1 .6.9V17" />
                        </svg>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-zinc-900">
                          {row.name}
                        </p>
                        <p className="text-sm text-zinc-500">{row.price}</p>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                          row.tone === "emerald"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {row.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="border-t border-zinc-200 py-20">
          <div className="mx-auto max-w-6xl px-6">
            <div className="max-w-xl">
              <h2 className="text-3xl font-semibold tracking-tight">
                How it works
              </h2>
              <p className="mt-3 text-zinc-600">
                Three steps, and your inventory is live everywhere it needs
                to be.
              </p>
            </div>
            <div className="mt-12 grid gap-6 sm:grid-cols-3">
              {steps.map((item) => (
                <div
                  key={item.step}
                  className="group relative rounded-2xl border border-zinc-200 bg-white p-6 transition-shadow hover:shadow-lg hover:shadow-zinc-200/60"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      className="h-5.5 w-5.5"
                      stroke="currentColor"
                      strokeWidth="1.75"
                    >
                      {item.icon}
                    </svg>
                  </div>
                  <span className="mt-5 block text-xs font-semibold tracking-wide text-indigo-600 uppercase">
                    Step {item.step}
                  </span>
                  <h3 className="mt-1 text-lg font-medium text-zinc-900">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm text-zinc-600">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Platforms */}
        <section
          id="platforms"
          className="border-t border-zinc-200 bg-zinc-50 py-20"
        >
          <div className="mx-auto max-w-6xl px-6">
            <div className="max-w-xl">
              <h2 className="text-3xl font-semibold tracking-tight">
                Where your listings can go
              </h2>
              <p className="mt-3 text-zinc-600">
                We&apos;re rolling platforms out one at a time, starting with
                the ones dealers ask for most.
              </p>
            </div>
            <ul className="mt-10 grid gap-4 sm:grid-cols-3">
              {platforms.map((platform) => (
                <li
                  key={platform.id}
                  className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-900 text-sm font-semibold text-white">
                      {platform.name.charAt(0)}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[platform.status]}`}
                    >
                      {statusLabels[platform.status]}
                    </span>
                  </div>
                  <p className="mt-4 font-medium text-zinc-900">
                    {platform.name}
                  </p>
                  <p className="mt-1 text-sm text-zinc-600">
                    {platform.note}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Pricing placeholder */}
        <section id="pricing" className="border-t border-zinc-200 py-20">
          <div className="mx-auto max-w-2xl px-6 text-center">
            <h2 className="text-3xl font-semibold tracking-tight">
              Pricing
            </h2>
            <p className="mt-3 text-zinc-600">
              Pricing isn&apos;t final yet. Leave your email and we&apos;ll
              let you know as soon as it&apos;s ready.
            </p>

            <div className="mx-auto mt-10 max-w-sm rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
              <span className="inline-flex rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
                Free while in beta
              </span>
              <p className="mt-4 text-sm text-zinc-600">
                Be the first to know when Dealer Post is ready for your
                inventory.
              </p>
              <form className="mt-6 flex flex-col gap-2 sm:flex-row">
                <input
                  type="email"
                  placeholder="you@dealership.com"
                  disabled
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm placeholder:text-zinc-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled
                  className="shrink-0 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white opacity-50"
                >
                  Notify me
                </button>
              </form>
              <p className="mt-3 text-xs text-zinc-400">
                Not wired up yet — placeholder for the email capture form.
              </p>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
