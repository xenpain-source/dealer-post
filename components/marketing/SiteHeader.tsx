import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-semibold tracking-tight whitespace-nowrap"
        >
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
        <nav className="flex items-center gap-3 text-sm font-medium text-zinc-600 sm:gap-8">
          <Link
            href="/#how-it-works"
            className="hidden transition-colors hover:text-zinc-900 sm:inline"
          >
            How it works
          </Link>
          <Link
            href="/#platforms"
            className="hidden transition-colors hover:text-zinc-900 sm:inline"
          >
            Platforms
          </Link>
          <Link
            href="/#pricing"
            className="hidden transition-colors hover:text-zinc-900 sm:inline"
          >
            Pricing
          </Link>
          <Link
            href="/login"
            className="rounded-full bg-zinc-900 px-4 py-2 text-white shadow-sm transition-colors hover:bg-indigo-600"
          >
            Log in
          </Link>
        </nav>
      </div>
    </header>
  );
}
