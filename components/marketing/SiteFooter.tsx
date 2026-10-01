import Link from "next/link";
import { BrandLogoSmall } from "@/components/BrandLogo";

export function SiteFooter() {
  return (
    <footer
      className="dl-dark"
      style={{ borderTop: "1px solid var(--border)" }}
    >
      <div className="dl-container flex flex-col gap-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/" aria-label="DealerLoft home">
          <BrandLogoSmall tone="white" className="h-5 w-auto" />
        </Link>

        <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 dl-small">
          <Link href="/#how-it-works" className="dl-link" style={{ color: "var(--text-muted)" }}>
            How it works
          </Link>
          <Link href="/#pricing" className="dl-link" style={{ color: "var(--text-muted)" }}>
            Pricing
          </Link>
          <Link href="/login" className="dl-link" style={{ color: "var(--text-muted)" }}>
            Sign in
          </Link>
        </nav>

        <p className="dl-small">
          © {new Date().getFullYear()} DealerLoft · Privacy · Terms
        </p>
      </div>
    </footer>
  );
}
