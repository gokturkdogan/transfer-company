import Link from "next/link";
import { PackagePlus } from "lucide-react";

import { db } from "@/db/client";
import { ExtraForm } from "@/features/admin/components/ExtraForm";
import { AdminFormPage } from "@/features/admin/components/shell/AdminFormPage";
import { adminCopy } from "@/features/admin/copy";
import { CurrencyRepository } from "@/features/currencies/server/repository";
import { LocaleRepository } from "@/features/locales/server/repository";
import { Alert } from "@/components/ui/alert";

const currencyRepository = new CurrencyRepository(db);
const localeRepository = new LocaleRepository(db);

export default async function NewExtraPage() {
  const [enabledCurrencies, enabledLocales] = await Promise.all([
    currencyRepository.listEnabled(),
    localeRepository.listActive(),
  ]);

  return (
    <AdminFormPage
      title={adminCopy.extras.newTitle}
      subtitle={adminCopy.extras.newSubtitle}
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
          mode="create"
          enabledCurrencies={enabledCurrencies}
          enabledLocales={enabledLocales}
        />
      )}
    </AdminFormPage>
  );
}
