"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { updateEnabledCurrenciesAction } from "@/features/admin/server/actions";
import type { EnabledCurrencyRecord } from "@/features/currencies/server/repository";
import { adminCopy, translateAdminError } from "@/features/admin/copy";
import type { SupportedCurrency } from "@/config/currencies";
import { AdminContentCard } from "@/features/admin/components/shell/AdminContentCard";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CurrencySettingsFormProps = {
  supportedCurrencies: readonly SupportedCurrency[];
  enabledCurrencies: EnabledCurrencyRecord[];
};

export function CurrencySettingsForm({
  supportedCurrencies,
  enabledCurrencies,
}: CurrencySettingsFormProps) {
  const router = useRouter();
  const [selectedCodes, setSelectedCodes] = useState<string[]>(
    enabledCurrencies.map((currency) => currency.code),
  );
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const selectedCount = useMemo(
    () =>
      supportedCurrencies.filter((currency) =>
        selectedCodes.includes(currency.code),
      ).length,
    [selectedCodes, supportedCurrencies],
  );

  const toggleCurrency = (code: string) => {
    setSelectedCodes((current) =>
      current.includes(code)
        ? current.filter((item) => item !== code)
        : [...current, code],
    );
  };

  return (
    <AdminContentCard flush>
      <form
        className="divide-y divide-slate-100"
        onSubmit={(event) => {
          event.preventDefault();

          startTransition(async () => {
            setError(null);
            setSuccess(null);

            const result = await updateEnabledCurrenciesAction({
              codes: selectedCodes,
            });

            if (!result.success) {
              setError(translateAdminError(result.error.message));
              return;
            }

            setSuccess(adminCopy.currencies.saved);
            router.refresh();
          });
        }}
      >
        <div className="space-y-4 p-4 sm:p-5">
          {error ? <Alert variant="destructive">{error}</Alert> : null}
          {success ? <Alert>{success}</Alert> : null}

          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-medium text-slate-900">
              {adminCopy.currencies.formTitle}
            </p>
            <p className="text-xs text-muted-foreground">
              {adminCopy.currencies.activeCount(
                selectedCount,
                supportedCurrencies.length,
              )}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {supportedCurrencies.map((currency) => {
              const checked = selectedCodes.includes(currency.code);

              return (
                <label
                  key={currency.code}
                  className={cn(
                    "flex cursor-pointer flex-col gap-3 rounded-xl border p-3 transition-all sm:p-4",
                    checked
                      ? "border-blue-200 bg-blue-50/60 shadow-sm"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80",
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-2xl leading-none" aria-hidden>
                      {currency.emoji}
                    </span>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleCurrency(currency.code)}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      aria-label={`${currency.label} ${adminCopy.currencies.activeLabel}`}
                    />
                  </div>

                  <div className="min-w-0 space-y-0.5">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {currency.label.replace(/\s*\([^)]+\)\s*$/, "")}
                    </p>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      {currency.code}
                    </p>
                  </div>
                </label>
              );
            })}
          </div>

          <p className="text-xs leading-relaxed text-muted-foreground">
            {adminCopy.currencies.hint}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50/80 px-4 py-3 sm:px-5">
          <p className="text-xs text-slate-500">{adminCopy.currencies.saveHint}</p>
          <Button type="submit" disabled={isPending || selectedCodes.length === 0}>
            {isPending ? adminCopy.currencies.saving : adminCopy.currencies.save}
          </Button>
        </div>
      </form>
    </AdminContentCard>
  );
}
