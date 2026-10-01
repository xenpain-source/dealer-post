import Link from "next/link";
import { BrandLogoSmall } from "@/components/BrandLogo";

export function SiteHeader() {
  return (
    <header
      className="dl-dark sticky top-0 z-40 backdrop-blur-md"
      style={{
        borderBottom: "1px solid var(--border)",
        background: "color-mix(in srgb, var(--bg) 90%, transparent)",
      }}
    >
      <div className="dl-container">
        <nav className="dl-nav">
          <Link href="/" aria-label="DealerLoft home" className="brand">
            <BrandLogoSmall tone="white" className="h-6 w-auto" />
          </Link>
          <div className="links">
            <Link href="/#how-it-works">How it works</Link>
            <Link href="/#pricing">Pricing</Link>
            <Link href="/login">Sign in</Link>
          </div>
          <Link href="/signup" className="dl-btn dl-btn--primary">
            Join the beta
          </Link>
        </nav>
      </div>
    </header>
  );
}
