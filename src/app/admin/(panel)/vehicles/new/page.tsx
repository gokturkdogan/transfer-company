import { Car } from "lucide-react";

import { db } from "@/db/client";
import { VehicleForm } from "@/features/admin/components/VehicleForm";
import { AdminFormPage } from "@/features/admin/components/shell/AdminFormPage";
import { adminCopy } from "@/features/admin/copy";
import { LocaleRepository } from "@/features/locales/server/repository";

const localeRepository = new LocaleRepository(db);

export default async function NewVehiclePage() {
  const enabledLocales = await localeRepository.listActive();

  return (
    <AdminFormPage
      title={adminCopy.vehicles.newTitle}
      subtitle={adminCopy.vehicles.newSubtitle}
      icon={Car}
      backHref="/admin/vehicles"
    >
      <VehicleForm mode="create" enabledLocales={enabledLocales} />
    </AdminFormPage>
  );
}
