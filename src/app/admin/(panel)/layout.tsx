import { AdminSidebar } from "@/features/admin/components/AdminSidebar";
import { requireAdminSession } from "@/features/admin/server/auth";

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdminSession();

  return (
    <div className="flex min-h-screen">
      <AdminSidebar admin={admin} />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
