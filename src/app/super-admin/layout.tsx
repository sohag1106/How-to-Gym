import { requireRole } from "@/lib/auth";
import { AdminShell } from "@/components/nav/admin-shell";

const NAV_ITEMS = [
  { href: "/super-admin/gyms", label: "Gyms" },
  { href: "/super-admin/equipment-catalog", label: "Equipment Catalog" },
];

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole("super_admin");

  return (
    <AdminShell title="Super Admin" navItems={NAV_ITEMS}>
      {children}
    </AdminShell>
  );
}
