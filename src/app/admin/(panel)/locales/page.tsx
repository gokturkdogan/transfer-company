import { Languages } from "lucide-react";

import { SUPPORTED_LOCALES } from "@/config/locales";
import { db } from "@/db/client";
import { LocaleSettingsForm } from "@/features/admin/components/LocaleSettingsForm";
import { AdminPageHeader } from "@/features/admin/components/shell/AdminPageHeader";
import { adminCopy } from "@/features/admin/copy";
import { LocaleRepository } from "@/features/locales/server/repository";

const localeRepository = new LocaleRepository(db);

export default async function AdminLocalesPage() {
  const locales = await localeRepository.listAll();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={adminCopy.locales.title}
        subtitle={adminCopy.locales.subtitle}
        icon={Languages}
      />

      <LocaleSettingsForm
        supportedLocales={SUPPORTED_LOCALES}
        locales={locales}
      />
    </div>
  );
}
