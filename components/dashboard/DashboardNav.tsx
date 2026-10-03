"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { BrandLogoSmall } from "@/components/BrandLogo";

const links = [
  {
    href: "/dashboard",
    label: "Overview",
    icon: (
      <path
        d="M4 13h6V4H4v9Zm0 7h6v-5H4v5Zm10 0h6V11h-6v9Zm0-16v5h6V4h-6Z"
        strokeLinejoin="round"
      />
    ),
  },
  {
    href: "/dashboard/listings",
    label: "Listings",
    icon: (
      <path
        d="M4 6h16M4 12h16M4 18h10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  {
    href: "/dashboard/listings/new",
    label: "New listing",
    icon: (
      <path
        d="M12 5v14M5 12h14"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  {
    href: "/dashboard/extension",
    label: "Extension",
    icon: (
      <path
        d="M9 4h6v3a2 2 0 1 0 4 0V4h1v6h-3a2 2 0 1 0 0 4h3v6h-6v-3a2 2 0 1 0-4 0v3H4v-6h3a2 2 0 1 0 0-4H4V4h5Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <aside className="dl-sidebar flex shrink-0 flex-row gap-1 overflow-x-auto sm:h-full sm:flex-col sm:overflow-visible">
      <Link
        href="/"
        aria-label="DealerLoft home"
        className="brand hidden sm:block"
      >
        <BrandLogoSmall tone="cobalt" className="h-6 w-auto" />
      </Link>

      {links.map((link) => {
        const isActive = pathname === link.href;

        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={isActive ? "page" : undefined}
            className="dl-side-link shrink-0"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              {link.icon}
            </svg>
            <span className="hidden sm:inline">{link.label}</span>
          </Link>
        );
      })}

      <div className="mt-auto hidden flex-col gap-1 pt-6 sm:flex">
        <div className="dl-side-link" style={{ cursor: "default" }}>
          <UserButton />
          Account
        </div>
        <Link href="/" className="dl-side-link">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M10 19 3 12l7-7M3 12h18" />
          </svg>
          Back to site
        </Link>
      </div>
    </aside>
  );
}
