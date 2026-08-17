import { Shield } from "lucide-react";

import { db } from "@/db/client";
import { PrivacyPageSettingsForm } from "@/features/admin/components/PrivacyPageSettingsForm";
import { AdminPageHeader } from "@/features/admin/components/shell/AdminPageHeader";
import { adminCopy } from "@/features/admin/copy";
import { getDefaultKvkkHtmlTr } from "@/features/privacy/lib/get-default-kvkk-html";
import { PrivacyPageRepository } from "@/features/privacy/server/repository";
import { LocaleRepository } from "@/features/locales/server/repository";

const privacyPageRepository = new PrivacyPageRepository(db);
const localeRepository = new LocaleRepository(db);

export default async function AdminPrivacyPage() {
  const [enabledLocales, translations, defaultHtmlTr] = await Promise.all([
    localeRepository.listActive(),
    privacyPageRepository.listAll(),
    getDefaultKvkkHtmlTr(),
  ]);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={adminCopy.privacyPage.title}
        subtitle={adminCopy.privacyPage.subtitle}
        icon={Shield}
      />

      <PrivacyPageSettingsForm
        enabledLocales={enabledLocales}
        translations={translations}
        defaultHtmlTr={defaultHtmlTr}
      />
    </div>
  );
}
