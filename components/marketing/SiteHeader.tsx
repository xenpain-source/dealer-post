import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" aria-label="DealerLoft home">
          <BrandLogo className="h-6 w-auto sm:h-7" />
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
            className="rounded-full bg-zinc-900 px-4 py-2 text-white shadow-sm transition-colors hover:bg-cobalt-600"
          >
            Log in
          </Link>
        </nav>
      </div>
    </header>
  );
}
