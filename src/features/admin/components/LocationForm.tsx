"use client";

import { Hash, MapPin, Settings2 } from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  createLocationAction,
  updateLocationAction,
} from "@/features/admin/server/actions";
import type { AdminLocationRecord } from "@/features/admin/server/location-admin-repository";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type SelectOption = {
  id: string;
  label: string;
  cityId?: string;
};

type LocationFormProps = {
  mode: "create" | "edit";
  type: "AIRPORT" | "CITY" | "DISTRICT" | "HOTEL";
  location?: AdminLocationRecord;
  parentOptions: SelectOption[];
  cityOptions?: SelectOption[];
  initialCityId?: string | null;
  enabledLocales: EnabledLocaleRecord[];
};

function buildTranslationState(
  enabledLocales: EnabledLocaleRecord[],
  seed?: Record<string, string>,
): Record<string, string> {
  return Object.fromEntries(
    enabledLocales.map((locale) => [locale.code, seed?.[locale.code] ?? ""]),
  );
}

export function LocationForm({
  mode,
  type,
  location,
  parentOptions,
  cityOptions = [],
  initialCityId = null,
  enabledLocales,
}: LocationFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [selectedCityId, setSelectedCityId] = useState(
    initialCityId ?? cityOptions[0]?.id ?? "",
  );
  const [translations, setTranslations] = useState(() =>
    buildTranslationState(enabledLocales, location?.translations),
  );

  const districtOptions = useMemo(() => {
    if (type !== "HOTEL" || !selectedCityId) {
      return parentOptions;
    }

    return parentOptions.filter(
      (option) => option.cityId === selectedCityId,
    );
  }, [parentOptions, selectedCityId, type]);

  const hierarchySection =
    type !== "CITY" ? (
      <AdminFormSection
        title="Konum hiyerarşisi"
        description="Üst konum ilişkisini seçin."
        icon={MapPin}
        compact
      >
        {type === "HOTEL" && cityOptions.length > 0 ? (
          <AdminFormGrid cols={2}>
            <AdminField label={adminCopy.locationForm.city} htmlFor="cityId">
              <AdminSelect
                id="cityId"
                value={selectedCityId}
                onChange={(event) => setSelectedCityId(event.target.value)}
              >
                {cityOptions.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.label}
                  </option>
                ))}
              </AdminSelect>
            </AdminField>

            <AdminField
              label={adminCopy.locationForm.district}
              htmlFor="parentId"
              required
            >
              <AdminSelect
                id="parentId"
                name="parentId"
                key={`${type}-${selectedCityId}`}
                defaultValue={location?.parentId ?? districtOptions[0]?.id ?? ""}
                required
              >
                {districtOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </AdminSelect>
            </AdminField>
          </AdminFormGrid>
        ) : (
          <AdminField
            label={
              type === "AIRPORT"
                ? adminCopy.locationForm.cityOptional
                : adminCopy.locationForm.city
            }
            htmlFor="parentId"
            required={type === "DISTRICT"}
          >
            <AdminSelect
              id="parentId"
              name="parentId"
              key={`${type}-${selectedCityId}`}
              defaultValue={location?.parentId ?? parentOptions[0]?.id ?? ""}
              required={type === "DISTRICT"}
            >
              {type === "AIRPORT" ? (
                <option value="">{adminCopy.locationForm.noCity}</option>
              ) : null}
              {parentOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </AdminSelect>
          </AdminField>
        )}

        {type === "HOTEL" ? (
          <AdminField label={adminCopy.locationForm.address} htmlFor="address">
            <Textarea
              id="address"
              name="address"
              rows={2}
              defaultValue={location?.address ?? ""}
            />
          </AdminField>
        ) : null}
      </AdminFormSection>
    ) : null;

  const publishSection = (
    <AdminFormSection
      title="Yayın ayarları"
      description="Sıralama ve görünürlük."
      icon={Settings2}
      compact
      contentClassName="space-y-0"
    >
      <AdminFormGrid cols={2}>
        <AdminField label={adminCopy.locationForm.sortOrder} htmlFor="sortOrder">
          <Input
            id="sortOrder"
            name="sortOrder"
            type="number"
            min={0}
            defaultValue={location?.sortOrder ?? 0}
          />
        </AdminField>
        <AdminToggleField
          name="isActive"
          label={adminCopy.locationForm.active}
          defaultChecked={location?.isActive ?? true}
        />
      </AdminFormGrid>
    </AdminFormSection>
  );

  return (
    <AdminFormShell
      error={error}
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);

        const payload = {
          type,
          code: formData.get("code"),
          translations,
          parentId:
            type === "CITY" ? null : formData.get("parentId") || null,
          address: formData.get("address") || null,
          sortOrder: formData.get("sortOrder"),
          isActive: formData.get("isActive") === "on",
        };

        startTransition(async () => {
          setError(null);

          const result =
            mode === "create"
              ? await createLocationAction(payload)
              : await updateLocationAction({
                  id: location?.id,
                  ...payload,
                });

          if (!result.success) {
            setError(translateAdminError(result.error.message));
            return;
          }

          router.push("/admin/locations");
          router.refresh();
        });
      }}
      actions={
        <>
          <Button type="submit" disabled={isPending}>
            {isPending
              ? adminCopy.locationForm.saving
              : mode === "create"
                ? adminCopy.locationForm.create
                : adminCopy.locationForm.save}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/locations")}
          >
            {adminCopy.locationForm.cancel}
          </Button>
        </>
      }
    >
      <AdminFormRow>
        <AdminFormStack>
          <AdminFormSection
            title="Temel bilgiler"
            description="Konum kodu benzersiz tanımlayıcıdır."
            icon={Hash}
            compact
            contentClassName="space-y-0"
          >
            <AdminField label={adminCopy.locationForm.code} htmlFor="code" required>
              <Input
                id="code"
                name="code"
                defaultValue={location?.code}
                required
              />
            </AdminField>
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
          {hierarchySection ?? publishSection}
          {hierarchySection ? publishSection : null}
        </AdminFormStack>
      </AdminFormRow>
    </AdminFormShell>
  );
}
