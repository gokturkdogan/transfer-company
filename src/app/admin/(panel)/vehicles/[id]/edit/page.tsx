import { Car } from "lucide-react";
import { notFound } from "next/navigation";

import { db } from "@/db/client";
import { VehicleForm } from "@/features/admin/components/VehicleForm";
import { AdminFormPage } from "@/features/admin/components/shell/AdminFormPage";
import { adminCopy } from "@/features/admin/copy";
import { VehicleAdminRepository } from "@/features/admin/server/vehicle-admin-repository";
import { LocaleRepository } from "@/features/locales/server/repository";

const vehicleAdminRepository = new VehicleAdminRepository(db);
const localeRepository = new LocaleRepository(db);

export default async function EditVehiclePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [vehicle, enabledLocales] = await Promise.all([
    vehicleAdminRepository.findById(id),
    localeRepository.listActive(),
  ]);

  if (!vehicle) {
    notFound();
  }

  return (
    <AdminFormPage
      title={adminCopy.vehicles.editTitle}
      subtitle={adminCopy.vehicles.editSubtitle}
      icon={Car}
      backHref="/admin/vehicles"
    >
      <VehicleForm mode="edit" vehicle={vehicle} enabledLocales={enabledLocales} />
    </AdminFormPage>
  );
}
