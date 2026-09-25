import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-zinc-200">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Dealer Post
        </Link>
        <nav className="flex items-center gap-6 text-sm text-zinc-600">
          <Link href="/#how-it-works" className="hover:text-zinc-900">
            How it works
          </Link>
          <Link href="/#pricing" className="hover:text-zinc-900">
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
