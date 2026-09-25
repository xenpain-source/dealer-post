import Link from "next/link";

const links = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/listings", label: "Listings" },
  { href: "/dashboard/listings/new", label: "New listing" },
];

export function DashboardNav() {
  return (
    <aside className="shrink-0 border-b border-zinc-200 p-4 sm:w-56 sm:border-b-0 sm:border-r">
      <Link
        href="/"
        className="mb-4 block text-lg font-semibold sm:mb-8"
      >
        Dealer Post
      </Link>
      <nav className="flex flex-row gap-1 overflow-x-auto text-sm sm:flex-col sm:overflow-visible">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="shrink-0 rounded-md px-3 py-2 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
