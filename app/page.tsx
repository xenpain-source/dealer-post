import Link from "next/link";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { platforms } from "@/lib/platforms";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto max-w-6xl px-6 py-24 text-center">
          <h1 className="mx-auto max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
            Post your used car inventory everywhere, from one place.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-zinc-600">
            Take a few photos, fill in the details once, and get your
            listings out to buyers across the platforms they&apos;re
            already browsing.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              href="/login"
              className="rounded-full bg-zinc-900 px-6 py-3 text-sm font-medium text-white hover:bg-zinc-700"
            >
              Get started
            </Link>
            <Link
              href="#how-it-works"
              className="rounded-full border border-zinc-300 px-6 py-3 text-sm font-medium text-zinc-700 hover:border-zinc-400"
            >
              See how it works
            </Link>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="border-t border-zinc-200 py-20">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="text-2xl font-semibold tracking-tight">
              How it works
            </h2>
            <div className="mt-10 grid gap-8 sm:grid-cols-3">
              {[
                {
                  step: "1",
                  title: "Add a car",
                  body: "Snap photos on your phone and fill in year, make, model, mileage and price.",
                },
                {
                  step: "2",
                  title: "Pick where it goes",
                  body: "Choose which platforms this listing should appear on.",
                },
                {
                  step: "3",
                  title: "Publish once",
                  body: "Your listing goes out everywhere you picked, without retyping it each time.",
                },
              ].map((item) => (
                <div key={item.step}>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-sm font-medium text-white">
                    {item.step}
                  </div>
                  <h3 className="mt-4 font-medium">{item.title}</h3>
                  <p className="mt-2 text-sm text-zinc-600">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Platforms */}
        <section className="border-t border-zinc-200 py-20">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="text-2xl font-semibold tracking-tight">
              Where your listings can go
            </h2>
            <p className="mt-2 text-sm text-zinc-600">
              We&apos;re rolling platforms out one at a time, starting with
              the ones dealers ask for most.
            </p>
            <ul className="mt-8 grid gap-4 sm:grid-cols-3">
              {platforms.map((platform) => (
                <li
                  key={platform.id}
                  className="rounded-lg border border-zinc-200 p-5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{platform.name}</span>
                    <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600">
                      {platform.status === "live"
                        ? "Live"
                        : platform.status === "in-progress"
                          ? "In progress"
                          : "Planned"}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-zinc-600">
                    {platform.note}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Pricing placeholder */}
        <section id="pricing" className="border-t border-zinc-200 py-20">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="text-2xl font-semibold tracking-tight">
              Pricing
            </h2>
            <p className="mt-2 max-w-xl text-sm text-zinc-600">
              Pricing isn&apos;t final yet. Leave your email and we&apos;ll
              let you know as soon as it&apos;s ready.
            </p>
            <form className="mt-6 flex max-w-sm gap-2">
              <input
                type="email"
                placeholder="you@dealership.com"
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
                disabled
              />
              <button
                type="submit"
                disabled
                className="shrink-0 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white opacity-50"
              >
                Notify me
              </button>
            </form>
            <p className="mt-2 text-xs text-zinc-400">
              Not wired up yet — placeholder for the email capture form.
            </p>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
