import { Coins } from "lucide-react";

import { db } from "@/db/client";
import { CurrencySettingsForm } from "@/features/admin/components/CurrencySettingsForm";
import { AdminPageHeader } from "@/features/admin/components/shell/AdminPageHeader";
import { adminCopy } from "@/features/admin/copy";
import { CASH_PAYMENT_CURRENCIES } from "@/config/currencies";
import { CurrencyRepository } from "@/features/currencies/server/repository";

const currencyRepository = new CurrencyRepository(db);

export default async function AdminCurrenciesPage() {
  const enabledCurrencies = await currencyRepository.listEnabled();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={adminCopy.currencies.title}
        subtitle={adminCopy.currencies.subtitle}
        icon={Coins}
      />

      <CurrencySettingsForm
        supportedCurrencies={CASH_PAYMENT_CURRENCIES}
        enabledCurrencies={enabledCurrencies}
      />
    </div>
  );
}
