import { PackagePlus } from "lucide-react";
import { notFound } from "next/navigation";

import { db } from "@/db/client";
import { ExtraForm } from "@/features/admin/components/ExtraForm";
import { AdminFormPage } from "@/features/admin/components/shell/AdminFormPage";
import { adminCopy } from "@/features/admin/copy";
import { ExtraAdminRepository } from "@/features/admin/server/extra-admin-repository";
import { LocaleRepository } from "@/features/locales/server/repository";

const extraAdminRepository = new ExtraAdminRepository(db);
const localeRepository = new LocaleRepository(db);

export default async function EditExtraPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [extra, enabledLocales] = await Promise.all([
    extraAdminRepository.findById(id),
    localeRepository.listActive(),
  ]);

  if (!extra) {
    notFound();
  }

  return (
    <AdminFormPage
      title={adminCopy.extras.editTitle}
      subtitle={adminCopy.extras.editSubtitle}
      icon={PackagePlus}
      backHref="/admin/extras"
    >
      <ExtraForm mode="edit" extra={extra} enabledLocales={enabledLocales} />
    </AdminFormPage>
  );
}
