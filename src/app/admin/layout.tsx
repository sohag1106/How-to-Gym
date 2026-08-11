import { requireRole } from "@/lib/auth";
import { AdminShell } from "@/components/nav/admin-shell";

const NAV_ITEMS = [
  { href: "/admin/members", label: "Members" },
  { href: "/admin/equipment", label: "Equipment" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole("gym_owner");

  return (
    <AdminShell title="Gym Admin" navItems={NAV_ITEMS}>
      {children}
    </AdminShell>
  );
}
