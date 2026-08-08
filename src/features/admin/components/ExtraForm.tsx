"use client";

import { Banknote, Hash, Settings2, SlidersHorizontal } from "lucide-react";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { getCurrencyEmoji } from "@/config/currencies";
import {
  createExtraAction,
  updateExtraAction,
} from "@/features/admin/server/actions";
import type { AdminExtraRecord } from "@/features/admin/server/extra-admin-repository";
import { adminCopy, translateAdminError } from "@/features/admin/copy";
import { LocaleTextFields } from "@/features/admin/components/LocaleTextFields";
import { AdminField } from "@/features/admin/components/shell/AdminField";
import {
  AdminFormGrid,
  AdminFormRow,
  AdminFormStack,
} from "@/features/admin/components/shell/AdminFormLayout";
import { AdminFormSection } from "@/features/admin/components/shell/AdminFormSection";
import { AdminFormShell } from "@/features/admin/components/shell/AdminFormShell";
import { AdminSelect } from "@/features/admin/components/shell/AdminSelect";
import { AdminToggleField } from "@/features/admin/components/shell/AdminToggleField";
import type { EnabledLocaleRecord } from "@/features/locales/server/repository";
import { EXTRA_PRICING_MODES } from "@/db/schema/enums";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type EnabledCurrency = {
  code: string;
  label: string;
};

type ExtraFormProps = {
  mode: "create" | "edit";
  extra?: AdminExtraRecord;
  enabledCurrencies: EnabledCurrency[];
  enabledLocales: EnabledLocaleRecord[];
};

function majorFromMinor(priceMinor: number): string {
  return (priceMinor / 100).toFixed(2);
}

function buildTranslationState(
  enabledLocales: EnabledLocaleRecord[],
  seed?: Record<string, string>,
): Record<string, string> {
  return Object.fromEntries(
    enabledLocales.map((locale) => [locale.code, seed?.[locale.code] ?? ""]),
  );
}

export function ExtraForm({
  mode,
  extra,
  enabledCurrencies,
  enabledLocales,
}: ExtraFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [autoSuggested, setAutoSuggested] = useState(extra?.autoSuggested ?? false);
  const [translations, setTranslations] = useState(() =>
    buildTranslationState(enabledLocales, extra?.translations),
  );

  const priceByCurrency = new Map(
    (extra?.prices ?? []).map((price) => [price.currency, price.priceMinor]),
  );

  return (
    <AdminFormShell
      error={error}
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);

        const maxQuantityRaw = formData.get("maxQuantity");
        const luggageRaw = formData.get("luggageCapacityPerUnit");

        const payload = {
          code: formData.get("code"),
          translations,
          pricingMode: formData.get("pricingMode"),
          customerSelectable: formData.get("customerSelectable") === "on",
          autoSuggested: formData.get("autoSuggested") === "on",
          minQuantity: formData.get("minQuantity"),
          maxQuantity:
            maxQuantityRaw === "" || maxQuantityRaw === null
              ? null
              : maxQuantityRaw,
          luggageCapacityPerUnit:
            luggageRaw === "" || luggageRaw === null ? null : luggageRaw,
          sortOrder: formData.get("sortOrder"),
          isActive: formData.get("isActive") === "on",
          prices: enabledCurrencies.map((currency) => ({
            currency: currency.code,
            priceMajor: formData.get(`price_${currency.code}`),
          })),
        };

        startTransition(async () => {
          setError(null);

          const result =
            mode === "create"
              ? await createExtraAction(payload)
              : await updateExtraAction({
                  id: extra?.id,
                  ...payload,
                });

          if (!result.success) {
            setError(translateAdminError(result.error.message));
            return;
          }

          router.push("/admin/extras");
          router.refresh();
        });
      }}
      actions={
        <>
          <Button type="submit" disabled={isPending}>
            {isPending
              ? adminCopy.extras.form.saving
              : mode === "create"
                ? adminCopy.extras.form.create
                : adminCopy.extras.form.save}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/extras")}
          >
            {adminCopy.extras.form.cancel}
          </Button>
        </>
      }
    >
      <AdminFormRow>
        <AdminFormStack>
          <AdminFormSection
            title="Temel bilgiler"
            description="Extra servis kodu ve fiyatlandırma modu."
            icon={Hash}
            compact
            contentClassName="space-y-0"
          >
            <AdminFormGrid cols={2}>
              <AdminField label={adminCopy.extras.form.code} htmlFor="code" required>
                <Input
                  id="code"
                  name="code"
                  defaultValue={extra?.code}
                  required
                />
              </AdminField>
              <AdminField
                label={adminCopy.extras.form.pricingMode}
                htmlFor="pricingMode"
                required
              >
                <AdminSelect
                  id="pricingMode"
                  name="pricingMode"
                  defaultValue={extra?.pricingMode ?? "FIXED"}
                  required
                >
                  {EXTRA_PRICING_MODES.map((pricingMode) => (
                    <option key={pricingMode} value={pricingMode}>
                      {adminCopy.extras.pricingModes[pricingMode]}
                    </option>
                  ))}
                </AdminSelect>
              </AdminField>
            </AdminFormGrid>
          </AdminFormSection>

          <LocaleTextFields
            title={adminCopy.translations.sectionTitle}
            hint={adminCopy.translations.hint}
            fieldLabel={adminCopy.translations.name}
            enabledLocales={enabledLocales}
            values={translations}
            onChange={(locale, value) =>
              setTranslations((current) => ({ ...current, [locale]: value }))
            }
            compact
          />
        </AdminFormStack>

        <AdminFormStack>
          <AdminFormSection
            title="Davranış ve miktar"
            description="Müşteri seçimi ve otomatik öneri kuralları."
            icon={SlidersHorizontal}
            compact
          >
            <AdminFormGrid cols={2}>
              <AdminToggleField
                name="customerSelectable"
                label={adminCopy.extras.form.customerSelectable}
                defaultChecked={extra?.customerSelectable ?? true}
              />
              <AdminToggleField
                name="autoSuggested"
                label={adminCopy.extras.form.autoSuggested}
                defaultChecked={extra?.autoSuggested ?? false}
                onChange={(event) => setAutoSuggested(event.target.checked)}
              />
            </AdminFormGrid>

            <AdminFormGrid cols={2}>
              <AdminField
                label={adminCopy.extras.form.minQuantity}
                htmlFor="minQuantity"
                required
              >
                <Input
                  id="minQuantity"
                  name="minQuantity"
                  type="number"
                  min={0}
                  defaultValue={extra?.minQuantity ?? 1}
                  required
                />
              </AdminField>
              <AdminField
                label={adminCopy.extras.form.maxQuantity}
                htmlFor="maxQuantity"
                hint={adminCopy.extras.form.maxQuantityHint}
              >
                <Input
                  id="maxQuantity"
                  name="maxQuantity"
                  type="number"
                  min={1}
                  defaultValue={extra?.maxQuantity ?? ""}
                />
              </AdminField>
            </AdminFormGrid>

            {autoSuggested ? (
              <AdminField
                label={adminCopy.extras.form.luggageCapacityPerUnit}
                htmlFor="luggageCapacityPerUnit"
                hint={adminCopy.extras.form.luggageCapacityHint}
              >
                <Input
                  id="luggageCapacityPerUnit"
                  name="luggageCapacityPerUnit"
                  type="number"
                  min={1}
                  defaultValue={extra?.luggageCapacityPerUnit ?? ""}
                />
              </AdminField>
            ) : null}
          </AdminFormSection>

          <AdminFormSection title="Yayın ayarları" icon={Settings2} compact>
            <AdminFormGrid cols={2}>
              <AdminField label={adminCopy.extras.form.sortOrder} htmlFor="sortOrder">
                <Input
                  id="sortOrder"
                  name="sortOrder"
                  type="number"
                  min={0}
                  defaultValue={extra?.sortOrder ?? 0}
                />
              </AdminField>
              <AdminToggleField
                name="isActive"
                label={adminCopy.extras.form.active}
                defaultChecked={extra?.isActive ?? true}
              />
            </AdminFormGrid>
          </AdminFormSection>
        </AdminFormStack>
      </AdminFormRow>

      <AdminFormSection
        title={adminCopy.extras.form.pricesTitle}
        description={adminCopy.extras.form.pricesHint}
        icon={Banknote}
        compact
        contentClassName="space-y-0"
      >
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {enabledCurrencies.map((currency) => (
            <div
              key={currency.code}
              className="flex min-w-0 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2 py-1"
              title={currency.label}
            >
              <span className="flex shrink-0 items-center gap-0.5 text-[10px] font-semibold text-slate-500">
                <span className="text-sm leading-none" aria-hidden>
                  {getCurrencyEmoji(currency.code)}
                </span>
                {currency.code}
              </span>
              <Input
                id={`price_${currency.code}`}
                name={`price_${currency.code}`}
                type="number"
                min={0}
                step="0.01"
                defaultValue={
                  priceByCurrency.has(currency.code)
                    ? majorFromMinor(priceByCurrency.get(currency.code)!)
                    : ""
                }
                required
                className="h-8 min-w-0 flex-1 border-0 bg-transparent px-0 py-0 text-xs shadow-none focus-visible:ring-0"
                aria-label={adminCopy.extras.form.priceLabel(currency.code)}
              />
            </div>
          ))}
        </div>
      </AdminFormSection>
    </AdminFormShell>
  );
}
