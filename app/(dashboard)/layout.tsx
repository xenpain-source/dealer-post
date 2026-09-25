import { DashboardNav } from "@/components/dashboard/DashboardNav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1">
      <DashboardNav />
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
