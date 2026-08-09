"use client";

import { Car, ImageIcon, ListChecks, Settings2, Users } from "lucide-react";
import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  createVehicleAction,
  updateVehicleAction,
} from "@/features/admin/server/actions";
import type { AdminVehicleRecord } from "@/features/admin/server/vehicle-admin-repository";
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
import { AdminToggleField } from "@/features/admin/components/shell/AdminToggleField";
import type { EnabledLocaleRecord } from "@/features/locales/server/repository";
import { VehicleImageUploadField } from "@/features/admin/components/VehicleImageUploadField";
import type { VehicleImageAssetName } from "@/features/admin/components/VehicleImageUploadField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MAX_VEHICLE_FEATURES } from "@/features/vehicles/domain/constants";

const GALLERY_SLOT_COUNT = 3;
const GALLERY_ASSET_NAMES: VehicleImageAssetName[] = [
  "gallery-1",
  "gallery-2",
  "gallery-3",
];

type VehicleFormProps = {
  mode: "create" | "edit";
  vehicle?: AdminVehicleRecord;
  enabledLocales: EnabledLocaleRecord[];
};

function createClientId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random()}`;
}

type FeatureRowState = {
  clientId: string;
  labels: Record<string, string>;
};

function buildTranslationState(
  enabledLocales: EnabledLocaleRecord[],
  seed?: Record<string, string>,
): Record<string, string> {
  return Object.fromEntries(
    enabledLocales.map((locale) => [locale.code, seed?.[locale.code] ?? ""]),
  );
}

function toFeatureRows(
  enabledLocales: EnabledLocaleRecord[],
  features: AdminVehicleRecord["features"] | undefined,
): FeatureRowState[] {
  return (features ?? []).map((feature) => ({
    clientId: createClientId(),
    labels: buildTranslationState(enabledLocales, feature.labels),
  }));
}

function normalizeGalleryKeys(keys: string[] | undefined): string[] {
  const normalized = [...(keys ?? [])];
  while (normalized.length < GALLERY_SLOT_COUNT) {
    normalized.push("");
  }
  return normalized.slice(0, GALLERY_SLOT_COUNT);
}

export function VehicleForm({ mode, vehicle, enabledLocales }: VehicleFormProps) {
  const router = useRouter();
  const codeInputRef = useRef<HTMLInputElement>(null);
  const brandInputRef = useRef<HTMLInputElement>(null);
  const modelInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [coverImageKey, setCoverImageKey] = useState(vehicle?.coverImageKey ?? "");
  const [galleryKeys, setGalleryKeys] = useState<string[]>(
    normalizeGalleryKeys(vehicle?.galleryImageKeys),
  );
  const [nameTranslations, setNameTranslations] = useState(() =>
    buildTranslationState(enabledLocales, vehicle?.nameTranslations),
  );
  const [featureRows, setFeatureRows] = useState<FeatureRowState[]>(() =>
    toFeatureRows(enabledLocales, vehicle?.features),
  );

  const getVehicleIdentity = () => ({
    code: codeInputRef.current?.value ?? "",
    brand: brandInputRef.current?.value ?? "",
    model: modelInputRef.current?.value ?? "",
  });

  return (
    <AdminFormShell
      error={error}
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);

        const payload = {
          code: formData.get("code"),
          brand: formData.get("brand"),
          model: formData.get("model"),
          nameTranslations,
          passengerCapacity: formData.get("passengerCapacity"),
          largeLuggageCapacity: formData.get("largeLuggageCapacity"),
          cabinLuggageCapacity: vehicle?.cabinLuggageCapacity ?? 0,
          features: featureRows.map((row) => ({ labels: row.labels })),
          coverImageKey: coverImageKey || null,
          galleryImageKeys: galleryKeys,
          sortOrder: formData.get("sortOrder"),
          isActive: formData.get("isActive") === "on",
        };

        startTransition(async () => {
          setError(null);

          const result =
            mode === "create"
              ? await createVehicleAction(payload)
              : await updateVehicleAction({
                  id: vehicle?.id,
                  ...payload,
                });

          if (!result.success) {
            setError(translateAdminError(result.error.message));
            return;
          }

          router.push("/admin/vehicles");
          router.refresh();
        });
      }}
      actions={
        <>
          <Button type="submit" disabled={isPending}>
            {isPending
              ? adminCopy.vehicles.form.saving
              : mode === "create"
                ? adminCopy.vehicles.form.create
                : adminCopy.vehicles.form.save}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/vehicles")}
          >
            {adminCopy.vehicles.form.cancel}
          </Button>
        </>
      }
    >
      <AdminFormRow>
        <AdminFormStack>
          <AdminFormSection
            title="Araç kimliği"
            description="Kod, marka ve model bilgileri."
            icon={Car}
            compact
          >
            <AdminFormGrid cols={4}>
              <AdminField label={adminCopy.vehicles.form.code} htmlFor="code" required>
                <Input
                  id="code"
                  name="code"
                  ref={codeInputRef}
                  defaultValue={vehicle?.code}
                  required
                />
              </AdminField>
              <AdminField label={adminCopy.vehicles.form.brand} htmlFor="brand" required>
                <Input
                  id="brand"
                  name="brand"
                  ref={brandInputRef}
                  defaultValue={vehicle?.brand}
                  required
                />
              </AdminField>
              <AdminField label={adminCopy.vehicles.form.model} htmlFor="model" required>
                <Input
                  id="model"
                  name="model"
                  ref={modelInputRef}
                  defaultValue={vehicle?.model}
                  required
                />
              </AdminField>
              <AdminField label={adminCopy.vehicles.form.sortOrder} htmlFor="sortOrder">
                <Input
                  id="sortOrder"
                  name="sortOrder"
                  type="number"
                  min={0}
                  defaultValue={vehicle?.sortOrder ?? 0}
                />
              </AdminField>
            </AdminFormGrid>
          </AdminFormSection>

          <LocaleTextFields
            title={adminCopy.translations.sectionTitle}
            hint={adminCopy.translations.hint}
            fieldLabel={adminCopy.vehicles.form.displayName}
            enabledLocales={enabledLocales}
            values={nameTranslations}
            onChange={(locale, value) =>
              setNameTranslations((current) => ({ ...current, [locale]: value }))
            }
            compact
          />

          <AdminFormSection
            title="Kapasite"
            description="Yolcu ve bagaj limitleri."
            icon={Users}
            compact
            contentClassName="space-y-0"
          >
            <AdminFormGrid cols={3}>
              <AdminField
                label={adminCopy.vehicles.form.passengerCapacity}
                htmlFor="passengerCapacity"
                required
              >
                <Input
                  id="passengerCapacity"
                  name="passengerCapacity"
                  type="number"
                  min={1}
                  defaultValue={vehicle?.passengerCapacity ?? 1}
                  required
                />
              </AdminField>
              <AdminField
                label={adminCopy.vehicles.form.largeLuggageCapacity}
                htmlFor="largeLuggageCapacity"
                required
              >
                <Input
                  id="largeLuggageCapacity"
                  name="largeLuggageCapacity"
                  type="number"
                  min={0}
                  defaultValue={vehicle?.largeLuggageCapacity ?? 0}
                  required
                />
              </AdminField>
            </AdminFormGrid>
          </AdminFormSection>
        </AdminFormStack>

        <AdminFormStack>
          <AdminFormSection
            title="Kapak görseli"
            description="16:9 oranında kırpılarak Cloudinary'ye yüklenir."
            icon={ImageIcon}
            compact
          >
            <VehicleImageUploadField
              label={adminCopy.vehicles.form.coverImage}
              hint={adminCopy.vehicles.form.coverImageHint}
              value={coverImageKey}
              assetName="cover"
              getVehicleIdentity={getVehicleIdentity}
              onChange={setCoverImageKey}
            />
          </AdminFormSection>

          <AdminFormSection
            title="Yayın ayarları"
            icon={Settings2}
            compact
            contentClassName="space-y-0"
          >
            <AdminToggleField
              name="isActive"
              label={adminCopy.vehicles.form.active}
              defaultChecked={vehicle?.isActive ?? true}
            />
          </AdminFormSection>
        </AdminFormStack>
      </AdminFormRow>

      <AdminFormSection
        title={adminCopy.vehicles.form.galleryImages}
        description={adminCopy.vehicles.form.coverImageHint}
        icon={ImageIcon}
        compact
        contentClassName="space-y-0"
      >
        <AdminFormGrid cols={3} className="sm:grid-cols-2 lg:grid-cols-3">
          {galleryKeys.map((value, index) => (
            <VehicleImageUploadField
              key={index}
              compact
              label={adminCopy.vehicles.form.galleryImageLabel(index + 1)}
              value={value}
              assetName={GALLERY_ASSET_NAMES[index]!}
              getVehicleIdentity={getVehicleIdentity}
              onChange={(nextValue) => {
                const next = [...galleryKeys];
                next[index] = nextValue;
                setGalleryKeys(normalizeGalleryKeys(next));
              }}
            />
          ))}
        </AdminFormGrid>
      </AdminFormSection>

      <AdminFormSection
        title={adminCopy.vehicles.form.featuresTitle}
        description={adminCopy.vehicles.form.featuresHint}
        icon={ListChecks}
        compact
      >
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            {adminCopy.vehicles.form.featuresLimit(
              featureRows.length,
              MAX_VEHICLE_FEATURES,
            )}
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={featureRows.length >= MAX_VEHICLE_FEATURES}
            onClick={() => {
              if (featureRows.length >= MAX_VEHICLE_FEATURES) {
                return;
              }

              setFeatureRows((current) => [
                ...current,
                {
                  clientId: createClientId(),
                  labels: buildTranslationState(enabledLocales),
                },
              ]);
            }}
          >
            {adminCopy.vehicles.form.addFeature}
          </Button>
        </div>

        {featureRows.length === 0 ? (
          <p className="text-sm text-slate-500">
            {adminCopy.vehicles.form.featuresEmpty}
          </p>
        ) : (
          <div className="grid gap-3 lg:grid-cols-2">
            {featureRows.map((row) => (
              <div
                key={row.clientId}
                className="rounded-lg border border-dashed border-slate-200 bg-slate-50/50 p-3"
              >
                <LocaleTextFields
                  title={adminCopy.vehicles.form.featureLabel}
                  fieldLabel={adminCopy.translations.name}
                  enabledLocales={enabledLocales}
                  values={row.labels}
                  onChange={(locale, value) =>
                    setFeatureRows((current) =>
                      current.map((item) =>
                        item.clientId === row.clientId
                          ? {
                              ...item,
                              labels: { ...item.labels, [locale]: value },
                            }
                          : item,
                      ),
                    )
                  }
                  embedded
                  compact
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() =>
                    setFeatureRows((current) =>
                      current.filter((item) => item.clientId !== row.clientId),
                    )
                  }
                >
                  {adminCopy.vehicles.form.removeFeature}
                </Button>
              </div>
            ))}
          </div>
        )}
      </AdminFormSection>
    </AdminFormShell>
  );
}
