import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-zinc-200">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="text-lg font-semibold tracking-tight whitespace-nowrap"
        >
          Dealer Post
        </Link>
        <nav className="flex items-center gap-3 text-sm text-zinc-600 sm:gap-6">
          <Link
            href="/#how-it-works"
            className="hidden hover:text-zinc-900 sm:inline"
          >
            How it works
          </Link>
          <Link
            href="/#pricing"
            className="hidden hover:text-zinc-900 sm:inline"
          >
            Pricing
          </Link>
          <Link
            href="/login"
            className="rounded-full bg-zinc-900 px-4 py-2 text-white hover:bg-zinc-700"
          >
            Log in
          </Link>
        </nav>
      </div>
    </header>
  );
}
