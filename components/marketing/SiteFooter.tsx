export function SiteFooter() {
  return (
    <footer className="border-t border-zinc-200 py-8">
      <div className="mx-auto max-w-6xl px-6 text-sm text-zinc-500">
        © {new Date().getFullYear()} Dealer Post. Built for independent used
        car dealers.
      </div>
    </footer>
  );
}
