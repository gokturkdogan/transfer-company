import Link from "next/link";
import { PackagePlus } from "lucide-react";
import { notFound } from "next/navigation";

import { db } from "@/db/client";
import { ExtraForm } from "@/features/admin/components/ExtraForm";
import { AdminFormPage } from "@/features/admin/components/shell/AdminFormPage";
import { adminCopy } from "@/features/admin/copy";
import { ExtraAdminRepository } from "@/features/admin/server/extra-admin-repository";
import { CurrencyRepository } from "@/features/currencies/server/repository";
import { LocaleRepository } from "@/features/locales/server/repository";
import { Alert } from "@/components/ui/alert";

const extraAdminRepository = new ExtraAdminRepository(db);
const currencyRepository = new CurrencyRepository(db);
const localeRepository = new LocaleRepository(db);

export default async function EditExtraPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [extra, enabledCurrencies, enabledLocales] = await Promise.all([
    extraAdminRepository.findById(id),
    currencyRepository.listEnabled(),
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
      {enabledCurrencies.length === 0 ? (
        <Alert>
          {adminCopy.extras.emptyCurrencies}{" "}
          <Link href="/admin/currencies" className="font-medium underline">
            {adminCopy.currencies.open}
          </Link>
        </Alert>
      ) : (
        <ExtraForm
          mode="edit"
          extra={extra}
          enabledCurrencies={enabledCurrencies}
          enabledLocales={enabledLocales}
        />
      )}
    </AdminFormPage>
  );
}
