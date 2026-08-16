import { BookOpen } from "lucide-react";

import { db } from "@/db/client";
import { GuideForm } from "@/features/admin/components/GuideForm";
import { AdminFormPage } from "@/features/admin/components/shell/AdminFormPage";
import { adminCopy } from "@/features/admin/copy";
import { LocationAdminRepository } from "@/features/admin/server/location-admin-repository";
import { LocaleRepository } from "@/features/locales/server/repository";

const localeRepository = new LocaleRepository(db);
const locationAdminRepository = new LocationAdminRepository(db);

export default async function NewGuidePage() {
  const [enabledLocales, districts] = await Promise.all([
    localeRepository.listActive(),
    locationAdminRepository.findByType("DISTRICT", { includeInactive: false }),
  ]);

  return (
    <AdminFormPage
      title={adminCopy.guides.newTitle}
      subtitle={adminCopy.guides.newSubtitle}
      icon={BookOpen}
      backHref="/admin/guides"
    >
      <GuideForm
        mode="create"
        enabledLocales={enabledLocales}
        districts={districts.map((district) => ({
          code: district.code,
          name: district.defaultName,
        }))}
      />
    </AdminFormPage>
  );
}
