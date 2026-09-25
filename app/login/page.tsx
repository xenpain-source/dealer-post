import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Log in — Dealer Post",
};

export default function LoginPage() {
  return (
    <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-zinc-50 px-6 py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-40 flex justify-center"
      >
        <div className="h-[28rem] w-[56rem] rounded-full bg-gradient-to-b from-indigo-100 via-indigo-50 to-transparent blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-8 shadow-xl shadow-zinc-200/60">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-4.5 w-4.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 17h14M6 17a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm16 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z" />
              <path d="M3 17V9.6a1 1 0 0 1 .4-.8l3.2-2.4a2 2 0 0 1 1.2-.4h7.4a2 2 0 0 1 1.7 1l2.4 4 2.1.7a1 1 0 0 1 .6.9V17" />
            </svg>
          </span>
          Dealer Post
        </Link>
        <h1 className="mt-6 text-xl font-semibold tracking-tight">
          Welcome back
        </h1>
        <p className="mt-1 text-sm text-zinc-600">
          Placeholder screen — real auth isn&apos;t wired up yet.
        </p>

        <form className="mt-6 flex flex-col gap-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-zinc-700"
            >
              Email
            </label>
            <div className="relative mt-1">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-400"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 6.5A1.5 1.5 0 0 1 4.5 5h15A1.5 1.5 0 0 1 21 6.5v11a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5v-11Z M3.5 6l8.5 6.5L20.5 6" />
              </svg>
              <input
                id="email"
                name="email"
                type="email"
                disabled
                placeholder="you@dealership.com"
                className="w-full rounded-lg border border-zinc-300 py-2 pr-3 pl-9 text-sm placeholder:text-zinc-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:outline-none disabled:bg-zinc-50 disabled:text-zinc-400"
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-zinc-700"
            >
              Password
            </label>
            <div className="relative mt-1">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-400"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 11V7a6 6 0 1 1 12 0v4M5 11h14a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1Z" />
              </svg>
              <input
                id="password"
                name="password"
                type="password"
                disabled
                placeholder="••••••••"
                className="w-full rounded-lg border border-zinc-300 py-2 pr-3 pl-9 text-sm placeholder:text-zinc-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:outline-none disabled:bg-zinc-50 disabled:text-zinc-400"
              />
            </div>
          </div>

          {/* Links straight to the dashboard skeleton until real auth exists */}
          <Link
            href="/dashboard"
            className="mt-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-center text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700"
          >
            Continue to dashboard (demo)
          </Link>
        </form>

        <p className="mt-6 text-center text-xs text-zinc-400">
          Real sign-in isn&apos;t connected yet — this button skips straight
          to the dashboard.
        </p>
      </div>
    </div>
  );
}
