import { z } from "zod";

import { DEFAULT_CURRENCY, DEFAULT_LOCALE } from "@/config/constants";
import {
  normalizeLocaleTranslations,
  type LocaleTranslationMap,
} from "@/features/admin/server/translation-input";
import type { UpsertAdminExtraInput } from "@/features/admin/server/extra-admin-repository";
import type { UpsertAdminVehicleInput } from "@/features/admin/server/vehicle-admin-repository";
import {
  MAX_VEHICLE_BOOKING_PREVIEW_IMAGES,
  MAX_VEHICLE_FEATURES,
  MAX_VEHICLE_GALLERY_IMAGES,
} from "@/features/vehicles/domain/constants";
import { DomainRuleError } from "@/server/errors";
import { majorToMinor } from "@/lib/money";

export const adminLocationTypes = [
  "AIRPORT",
  "CITY",
  "DISTRICT",
  "HOTEL",
] as const;

export const translationsSchema = z.record(z.string(), z.string());

export const locationSchema = z.object({
  type: z.enum(adminLocationTypes),
  code: z.string().min(1).max(64),
  translations: translationsSchema,
  parentId: z.string().uuid().nullable().optional(),
  cityId: z.string().uuid().optional(),
  address: z.string().max(2000).nullable().optional(),
  latitude: z.coerce.number().min(-90).max(90).nullable().optional(),
  longitude: z.coerce.number().min(-180).max(180).nullable().optional(),
  sortOrder: z.coerce.number().int().min(0).default(0),
  isActive: z.coerce.boolean().default(true),
  imageKey: z.string().max(512).nullable().optional(),
  isFeaturedOnHomepage: z.coerce.boolean().default(false),
  featuredStartingPrices: z
    .record(z.string().length(3), z.coerce.number().min(0))
    .optional(),
});

export const updateLocationSchema = locationSchema.partial().extend({
  id: z.string().uuid(),
});

export function resolveParentId(
  input: z.infer<typeof locationSchema>,
): string | null {
  if (input.type === "CITY") {
    return null;
  }

  if (input.type === "HOTEL" || input.type === "DISTRICT") {
    return input.parentId ?? null;
  }

  return input.parentId ?? null;
}

export function mapLocationTranslations(
  translations: LocaleTranslationMap,
  enabledLocaleCodes: string[],
): LocaleTranslationMap {
  return normalizeLocaleTranslations(translations, enabledLocaleCodes);
}

export async function assertDistrictFeaturedInput(input: {
  type: string;
  isFeaturedOnHomepage?: boolean;
  imageKey?: string | null;
  featuredStartingPrices?: Record<string, number>;
}): Promise<void> {
  if (input.type !== "DISTRICT" || !input.isFeaturedOnHomepage) {
    return;
  }

  if (!input.imageKey?.trim()) {
    throw new DomainRuleError("FEATURED_IMAGE_REQUIRED");
  }

  const priceMajor = input.featuredStartingPrices?.[DEFAULT_CURRENCY];

  if (priceMajor === undefined || priceMajor <= 0) {
    throw new DomainRuleError("FEATURED_PRICE_REQUIRED");
  }
}

export function mapFeaturedStartingPricesToMinor(
  prices: Record<string, number> | undefined,
): Record<string, number> | undefined {
  if (!prices) {
    return undefined;
  }

  return Object.fromEntries(
    Object.entries(prices).map(([currency, amountMajor]) => [
      currency,
      majorToMinor(amountMajor),
    ]),
  );
}

export function buildDistrictFeaturedPayload(input: {
  type: string;
  imageKey?: string | null;
  isFeaturedOnHomepage?: boolean;
  featuredStartingPrices?: Record<string, number>;
}): {
  imageKey?: string | null;
  isFeaturedOnHomepage?: boolean;
  featuredStartingPrices?: Record<string, number>;
} {
  if (input.type !== "DISTRICT") {
    return {};
  }

  const isFeaturedOnHomepage = input.isFeaturedOnHomepage ?? false;

  return {
    imageKey: input.imageKey?.trim() || null,
    isFeaturedOnHomepage,
    featuredStartingPrices: isFeaturedOnHomepage
      ? mapFeaturedStartingPricesToMinor(input.featuredStartingPrices) ?? {}
      : {},
  };
}

const vehicleFeatureSchema = z.object({
  labels: translationsSchema,
});

const vehicleGalleryImageSchema = z.object({
  imageKey: z.string().trim().max(512),
  showInBookingPreview: z.boolean(),
});

export const vehicleSchema = z.object({
  code: z.string().min(1).max(32),
  brand: z.string().trim().min(1).max(100),
  model: z.string().trim().min(1).max(100),
  nameTranslations: translationsSchema,
  passengerCapacity: z.coerce.number().int().min(1),
  largeLuggageCapacity: z.coerce.number().int().min(0),
  cabinLuggageCapacity: z.coerce.number().int().min(0),
  features: z.array(vehicleFeatureSchema).max(MAX_VEHICLE_FEATURES),
  coverImageKey: z.string().trim().max(512).nullable().optional(),
  galleryImages: z
    .array(vehicleGalleryImageSchema)
    .max(MAX_VEHICLE_GALLERY_IMAGES),
  sortOrder: z.coerce.number().int().min(0).default(0),
  isActive: z.boolean(),
  displayStartingPrices: z
    .record(z.string(), z.coerce.number().min(0))
    .optional(),
});

export const updateVehicleSchema = vehicleSchema.extend({
  id: z.string().uuid(),
});

export function assertVehicleBookingPreviewInput(
  input: Pick<z.infer<typeof vehicleSchema>, "galleryImages">,
): void {
  const previewCount = input.galleryImages.filter(
    (image) => image.showInBookingPreview && image.imageKey.trim(),
  ).length;

  if (previewCount > MAX_VEHICLE_BOOKING_PREVIEW_IMAGES) {
    throw new DomainRuleError("VEHICLE_BOOKING_PREVIEW_LIMIT");
  }
}

export function mapVehicleInput(
  input: z.infer<typeof vehicleSchema>,
  enabledLocaleCodes: string[],
): UpsertAdminVehicleInput {
  assertVehicleBookingPreviewInput(input);

  const nameTranslations = normalizeLocaleTranslations(
    input.nameTranslations,
    enabledLocaleCodes,
  );

  const features = input.features
    .filter((feature) => feature.labels[DEFAULT_LOCALE]?.trim())
    .slice(0, MAX_VEHICLE_FEATURES)
    .map((feature) => ({
      labels: normalizeLocaleTranslations(feature.labels, enabledLocaleCodes),
    }));

  return {
    code: input.code,
    brand: input.brand,
    model: input.model,
    passengerCapacity: input.passengerCapacity,
    largeLuggageCapacity: input.largeLuggageCapacity,
    cabinLuggageCapacity: input.cabinLuggageCapacity,
    nameTranslations,
    features,
    coverImageKey: input.coverImageKey ?? null,
    galleryImages: input.galleryImages
      .filter((image) => image.imageKey.trim())
      .slice(0, MAX_VEHICLE_GALLERY_IMAGES)
      .map((image) => ({
        imageKey: image.imageKey.trim(),
        showInBookingPreview: image.showInBookingPreview,
      })),
    sortOrder: input.sortOrder,
    isActive: input.isActive,
    displayStartingPrices: mapFeaturedStartingPricesToMinor(
      input.displayStartingPrices,
    ),
  };
}

const extraPriceSchema = z.object({
  currency: z.string().length(3),
  priceMajor: z.coerce.number().min(0),
});

export const extraSchema = z.object({
  code: z.string().min(1).max(32),
  translations: translationsSchema,
  pricingMode: z.enum(["FIXED", "PER_UNIT"]),
  customerSelectable: z.boolean(),
  autoSuggested: z.boolean(),
  minQuantity: z.coerce.number().int().min(0),
  maxQuantity: z.coerce.number().int().min(1).nullable().optional(),
  includedQuantity: z.coerce.number().int().min(0).default(0),
  luggageCapacityPerUnit: z.coerce.number().int().min(1).nullable().optional(),
  sortOrder: z.coerce.number().int().min(0).default(0),
  isActive: z.boolean(),
  prices: z.array(extraPriceSchema).min(1),
});

export const updateExtraSchema = extraSchema.extend({
  id: z.string().uuid(),
});

export function mapExtraInput(
  input: z.infer<typeof extraSchema>,
  enabledLocaleCodes: string[],
): UpsertAdminExtraInput {
  const prices = input.prices
    .filter((price) => price.currency.toUpperCase() === DEFAULT_CURRENCY)
    .map((price) => ({
      currency: DEFAULT_CURRENCY,
      priceMinor: Math.round(price.priceMajor * 100),
    }));

  if (prices.length === 0) {
    throw new DomainRuleError("En az bir geçerli fiyat girmelisiniz");
  }

  const translations = normalizeLocaleTranslations(
    input.translations,
    enabledLocaleCodes,
  );

  return {
    code: input.code,
    translations,
    pricingMode: input.pricingMode,
    customerSelectable: input.customerSelectable,
    autoSuggested: input.autoSuggested,
    minQuantity: input.minQuantity,
    maxQuantity: input.maxQuantity ?? null,
    includedQuantity:
      input.pricingMode === "FIXED" ? 0 : input.includedQuantity,
    luggageCapacityPerUnit: input.luggageCapacityPerUnit ?? null,
    sortOrder: input.sortOrder,
    isActive: input.isActive,
    prices,
  };
}
