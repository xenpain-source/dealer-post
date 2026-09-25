import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-6">
      <div className="w-full max-w-sm rounded-lg border border-zinc-200 bg-white p-8 shadow-sm">
        <Link href="/" className="text-lg font-semibold">
          Dealer Post
        </Link>
        <h1 className="mt-6 text-xl font-semibold tracking-tight">
          Log in
        </h1>
        <p className="mt-1 text-sm text-zinc-600">
          Placeholder screen — real auth isn&apos;t wired up yet.
        </p>

        <form className="mt-6 flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700">
              Email
            </label>
            <input
              type="email"
              disabled
              placeholder="you@dealership.com"
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700">
              Password
            </label>
            <input
              type="password"
              disabled
              placeholder="••••••••"
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
            />
          </div>

          {/* Links straight to the dashboard skeleton until real auth exists */}
          <Link
            href="/dashboard"
            className="mt-2 rounded-md bg-zinc-900 px-4 py-2 text-center text-sm font-medium text-white hover:bg-zinc-700"
          >
            Continue to dashboard (demo)
          </Link>
        </form>
      </div>
    </div>
  );
}
