import dynamic from "next/dynamic";

import { db } from "@/db/client";
import { AdminPageHeader } from "@/features/admin/components/shell/AdminPageHeader";
import { DashboardPdfExportButton } from "@/features/admin/components/DashboardPdfExportButton";
import { adminCopy } from "@/features/admin/copy";
import { DashboardAdminRepository } from "@/features/admin/server/dashboard-admin-repository";
import { LayoutDashboard } from "lucide-react";

const AdminDashboard = dynamic(
  () =>
    import("@/features/admin/components/AdminDashboard").then(
      (module) => module.AdminDashboard,
    ),
  {
    loading: () => (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-28 rounded-xl border border-border/70 bg-muted/30"
          />
        ))}
      </div>
    ),
  },
);

const dashboardRepository = new DashboardAdminRepository(db);

export default async function AdminDashboardPage() {
  const data = await dashboardRepository.getDashboardData();

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title={adminCopy.dashboard.title}
        subtitle={adminCopy.dashboard.subtitle}
        icon={LayoutDashboard}
        actions={<DashboardPdfExportButton />}
      />
      <AdminDashboard data={data} />
    </div>
  );
}
