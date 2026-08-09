import { PackagePlus } from "lucide-react";

import { db } from "@/db/client";
import { ExtraForm } from "@/features/admin/components/ExtraForm";
import { AdminFormPage } from "@/features/admin/components/shell/AdminFormPage";
import { adminCopy } from "@/features/admin/copy";
import { LocaleRepository } from "@/features/locales/server/repository";

const localeRepository = new LocaleRepository(db);

export default async function NewExtraPage() {
  const enabledLocales = await localeRepository.listActive();

  return (
    <AdminFormPage
      title={adminCopy.extras.newTitle}
      subtitle={adminCopy.extras.newSubtitle}
      icon={PackagePlus}
      backHref="/admin/extras"
    >
      <ExtraForm mode="create" enabledLocales={enabledLocales} />
    </AdminFormPage>
  );
}
