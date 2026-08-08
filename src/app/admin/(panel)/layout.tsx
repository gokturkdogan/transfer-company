import { AdminSidebar } from "@/features/admin/components/AdminSidebar";
import { requireAdminSession } from "@/features/admin/server/auth";

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdminSession();

  return (
    <>
      <AdminSidebar admin={admin} />
      <main className="admin-main ml-[var(--admin-sidebar-width)] min-h-screen overflow-x-hidden">
        <div className="mx-auto max-w-7xl p-6 lg:p-8">{children}</div>
      </main>
    </>
  );
}
