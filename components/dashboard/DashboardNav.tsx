import Link from "next/link";

const links = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/listings", label: "Listings" },
  { href: "/dashboard/listings/new", label: "New listing" },
];

export function DashboardNav() {
  return (
    <aside className="w-56 shrink-0 border-r border-zinc-200 p-4">
      <Link href="/" className="mb-8 block text-lg font-semibold">
        Dealer Post
      </Link>
      <nav className="flex flex-col gap-1 text-sm">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-md px-3 py-2 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
