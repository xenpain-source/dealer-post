import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";

export function SiteFooter() {
  return (
    <footer className="border-t border-zinc-200 bg-zinc-50">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/" aria-label="DealerLoft home">
          <BrandLogo className="h-5 w-auto" />
        </Link>

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
          © {new Date().getFullYear()} DealerLoft. Built for independent used
          car dealers.
        </p>
      </div>
    </footer>
  );
}
