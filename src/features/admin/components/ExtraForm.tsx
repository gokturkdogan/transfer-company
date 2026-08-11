"use client";

import { Banknote, Hash, Settings2, SlidersHorizontal } from "lucide-react";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { DEFAULT_CURRENCY } from "@/config/constants";
import {
  createExtraAction,
  updateExtraAction,
} from "@/features/admin/server/actions";
import type { AdminExtraRecord } from "@/features/admin/server/extra-admin-repository";
import { ExtraDeleteButton } from "@/features/admin/components/ExtraDeleteButton";
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
import { EXTRA_PRICING_MODES } from "@/features/admin/lib/public-enums";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ExtraFormProps = {
  mode: "create" | "edit";
  extra?: AdminExtraRecord;
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
  const eurPriceMinor = priceByCurrency.get(DEFAULT_CURRENCY);

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
          includedQuantity: formData.get("includedQuantity"),
          luggageCapacityPerUnit:
            luggageRaw === "" || luggageRaw === null ? null : luggageRaw,
          sortOrder: formData.get("sortOrder"),
          isActive: formData.get("isActive") === "on",
          prices: [
            {
              currency: DEFAULT_CURRENCY,
              priceMajor: formData.get("price"),
            },
          ],
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
          {mode === "edit" && extra ? (
            <ExtraDeleteButton
              extraId={extra.id}
              extraName={extra.name}
              redirectToList
              size="default"
              className="ml-auto"
            />
          ) : null}
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

            <AdminFormGrid cols={3}>
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
              <AdminField
                label={adminCopy.extras.form.includedQuantity}
                htmlFor="includedQuantity"
                hint={adminCopy.extras.form.includedQuantityHint}
              >
                <Input
                  id="includedQuantity"
                  name="includedQuantity"
                  type="number"
                  min={0}
                  defaultValue={extra?.includedQuantity ?? 0}
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
        <AdminFormGrid cols={2}>
          <AdminField
            label={adminCopy.extras.form.priceLabel(DEFAULT_CURRENCY)}
            htmlFor="price"
            required
          >
            <Input
              id="price"
              name="price"
              type="number"
              min={0}
              step="0.01"
              defaultValue={eurPriceMinor ? majorFromMinor(eurPriceMinor) : ""}
              required
            />
          </AdminField>
        </AdminFormGrid>
      </AdminFormSection>
    </AdminFormShell>
  );
}
