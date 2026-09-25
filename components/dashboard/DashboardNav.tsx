"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";

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
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <aside className="flex shrink-0 flex-col border-b border-zinc-200 bg-white p-4 sm:h-full sm:w-60 sm:border-b-0 sm:border-r sm:p-5">
      <Link
        href="/"
        className="mb-6 flex items-center gap-2 text-lg font-semibold tracking-tight sm:mb-8"
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
      <nav className="flex flex-row gap-1 overflow-x-auto text-sm sm:flex-col sm:overflow-visible">
        {links.map((link) => {
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive ? "page" : undefined}
              className={`flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 font-medium transition-colors ${
                isActive
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
              }`}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-4.5 w-4.5 shrink-0"
                stroke="currentColor"
                strokeWidth="2"
              >
                {link.icon}
              </svg>
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto hidden flex-col gap-1 pt-6 sm:flex">
        <div className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-600">
          <UserButton />
          Account
        </div>
        <Link
          href="/"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="h-4 w-4 shrink-0"
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
