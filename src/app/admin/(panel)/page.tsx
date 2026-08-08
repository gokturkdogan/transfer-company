import { LayoutDashboard } from "lucide-react";

import { db } from "@/db/client";
import { AdminDashboard } from "@/features/admin/components/AdminDashboard";
import { AdminPageHeader } from "@/features/admin/components/shell/AdminPageHeader";
import { adminCopy } from "@/features/admin/copy";
import { DashboardAdminRepository } from "@/features/admin/server/dashboard-admin-repository";

const dashboardRepository = new DashboardAdminRepository(db);

export default async function AdminDashboardPage() {
  const data = await dashboardRepository.getDashboardData();

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title={adminCopy.dashboard.title}
        subtitle={adminCopy.dashboard.subtitle}
        icon={LayoutDashboard}
      />
      <AdminDashboard data={data} />
    </div>
  );
}
