import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-zinc-200 bg-zinc-50">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-600 text-white">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-3.5 w-3.5"
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
        </div>

        <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-zinc-600">
          <Link href="/#how-it-works" className="hover:text-zinc-900">
            How it works
          </Link>
          <Link href="/#platforms" className="hover:text-zinc-900">
            Platforms
          </Link>
          <Link href="/#pricing" className="hover:text-zinc-900">
            Pricing
          </Link>
          <Link href="/login" className="hover:text-zinc-900">
            Log in
          </Link>
        </nav>

        <p className="text-sm text-zinc-500">
          © {new Date().getFullYear()} Dealer Post. Built for independent
          used car dealers.
        </p>
      </div>
    </footer>
  );
}
