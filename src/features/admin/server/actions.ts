"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { db } from "@/db/client";
import {
  authenticateAdmin,
  deleteSession,
} from "@/features/admin/server/auth";
import { LocationAdminRepository } from "@/features/admin/server/location-admin-repository";
import {
  PricingAdminRepository,
  type UpsertRoutePriceInput,
} from "@/features/admin/server/pricing-admin-repository";
import { findSupportedCurrency, isSupportedCurrencyCode } from "@/config/currencies";
import { DEFAULT_LOCALE } from "@/config/constants";
import {
  normalizeLocaleTranslations,
  type LocaleTranslationMap,
} from "@/features/admin/server/translation-input";
import { isSupportedLocaleCode } from "@/config/locales";
import { CurrencyRepository } from "@/features/currencies/server/repository";
import {
  ExtraAdminRepository,
  type UpsertAdminExtraInput,
} from "@/features/admin/server/extra-admin-repository";
import {
  ContactChannelRepository,
  type UpsertContactChannelInput,
} from "@/features/contact/server/repository";
import {
  LocaleRepository,
  type UpsertEnabledLocaleInput,
} from "@/features/locales/server/repository";
import {
  VehicleAdminRepository,
  type UpsertAdminVehicleInput,
} from "@/features/admin/server/vehicle-admin-repository";
import { MAX_VEHICLE_FEATURES, MAX_VEHICLE_BOOKING_PREVIEW_IMAGES, MAX_VEHICLE_GALLERY_IMAGES } from "@/features/vehicles/domain/constants";
import type { ContactChannelType } from "@/db/schema/enums";
import { createAction } from "@/server/action";
import { DomainRuleError } from "@/server/errors";
import { failure } from "@/server/result";
import { toPublicError } from "@/server/errors";
import { majorToMinor, minorToMajor } from "@/lib/money";

const locationAdminRepository = new LocationAdminRepository(db);
const pricingAdminRepository = new PricingAdminRepository(db);
const currencyRepository = new CurrencyRepository(db);
const extraAdminRepository = new ExtraAdminRepository(db);
const contactChannelRepository = new ContactChannelRepository(db);
const localeRepository = new LocaleRepository(db);
const vehicleAdminRepository = new VehicleAdminRepository(db);

const adminLocationTypes = ["AIRPORT", "CITY", "DISTRICT", "HOTEL"] as const;

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const translationsSchema = z.record(z.string(), z.string());

const locationSchema = z.object({
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

const updateLocationSchema = locationSchema.partial().extend({
  id: z.string().uuid(),
});

const priceUpdateSchema = z.object({
  airportId: z.string().uuid(),
  prices: z.array(
    z.object({
      districtId: z.string().uuid(),
      vehicleCategoryId: z.string().uuid(),
      currency: z.string().length(3),
      oneWayPriceMajor: z.coerce.number().min(0),
      roundTripPriceMajor: z.coerce.number().min(0).nullable().optional(),
    }),
  ),
});

const enabledCurrenciesSchema = z.object({
  codes: z.array(z.string().length(3)).min(1),
});

const extraPriceSchema = z.object({
  currency: z.string().length(3),
  priceMajor: z.coerce.number().min(0),
});

const extraSchema = z.object({
  code: z.string().min(1).max(32),
  translations: translationsSchema,
  pricingMode: z.enum(["FIXED", "PER_UNIT"]),
  customerSelectable: z.boolean(),
  autoSuggested: z.boolean(),
  minQuantity: z.coerce.number().int().min(0),
  maxQuantity: z.coerce.number().int().min(1).nullable().optional(),
  luggageCapacityPerUnit: z.coerce.number().int().min(1).nullable().optional(),
  sortOrder: z.coerce.number().int().min(0).default(0),
  isActive: z.boolean(),
  prices: z.array(extraPriceSchema).min(1),
});

const updateExtraSchema = extraSchema.extend({
  id: z.string().uuid(),
});

const contactChannelItemSchema = z.object({
  id: z.string().uuid().optional(),
  type: z.enum(["EMAIL", "PHONE", "WHATSAPP"]),
  value: z.string().trim().min(1).max(255),
  isActive: z.boolean(),
});

const syncContactChannelsSchema = z
  .object({
    channels: z.array(contactChannelItemSchema),
  })
  .superRefine((data, ctx) => {
    data.channels.forEach((channel, index) => {
      if (channel.type !== "EMAIL") {
        return;
      }

      const parsed = z.string().email().safeParse(channel.value);
      if (!parsed.success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Geçerli bir e-posta adresi girin",
          path: ["channels", index, "value"],
        });
      }
    });
  });

function assignContactSortOrders(
  channels: z.infer<typeof contactChannelItemSchema>[],
): UpsertContactChannelInput[] {
  const orderByType = new Map<ContactChannelType, number>();

  return channels.map((channel) => {
    const sortOrder = orderByType.get(channel.type) ?? 0;
    orderByType.set(channel.type, sortOrder + 1);

    return {
      id: channel.id,
      type: channel.type,
      value: channel.value,
      isActive: channel.isActive,
      sortOrder,
    };
  });
}

const enabledLocaleItemSchema = z.object({
  code: z.string().trim().min(2).max(5),
  label: z.string().trim().min(1).max(64),
  isActive: z.boolean(),
});

const syncEnabledLocalesSchema = z
  .object({
    locales: z.array(enabledLocaleItemSchema).min(1),
  })
  .superRefine((data, ctx) => {
    const codes = new Set<string>();

    data.locales.forEach((locale, index) => {
      const normalized = locale.code.toLowerCase();

      if (!isSupportedLocaleCode(normalized)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Geçersiz dil kodu",
          path: ["locales", index, "code"],
        });
      }

      if (codes.has(normalized)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Aynı dil birden fazla kez eklenemez",
          path: ["locales", index, "code"],
        });
      }

      codes.add(normalized);
    });
  });

function mapEnabledLocales(
  input: z.infer<typeof syncEnabledLocalesSchema>,
): UpsertEnabledLocaleInput[] {
  const locales = input.locales.map((locale, index) => ({
    code: locale.code.toLowerCase(),
    label: locale.label,
    isActive: locale.isActive,
    sortOrder: index,
  }));

  const activeLocales = locales.filter((locale) => locale.isActive);
  if (activeLocales.length === 0) {
    throw new DomainRuleError("En az bir aktif dil olmalıdır");
  }

  const defaultLocale = locales.find((locale) => locale.code === DEFAULT_LOCALE);
  if (defaultLocale && !defaultLocale.isActive) {
    throw new DomainRuleError("Varsayılan dil pasif yapılamaz");
  }

  return locales;
}

const vehicleFeatureSchema = z.object({
  labels: translationsSchema,
});

const vehicleGalleryImageSchema = z.object({
  imageKey: z.string().trim().max(512),
  showInBookingPreview: z.boolean(),
});

const vehicleSchema = z.object({
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
});

const updateVehicleSchema = vehicleSchema.extend({
  id: z.string().uuid(),
});

function assertVehicleBookingPreviewInput(
  input: Pick<z.infer<typeof vehicleSchema>, "galleryImages">,
): void {
  const previewCount = input.galleryImages.filter(
    (image) => image.showInBookingPreview && image.imageKey.trim(),
  ).length;

  if (previewCount > MAX_VEHICLE_BOOKING_PREVIEW_IMAGES) {
    throw new DomainRuleError("VEHICLE_BOOKING_PREVIEW_LIMIT");
  }
}

function mapVehicleInput(
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
  };
}

function mapExtraInput(
  input: z.infer<typeof extraSchema>,
  enabledCodes: string[],
  enabledLocaleCodes: string[],
): UpsertAdminExtraInput {
  const prices = input.prices
    .filter((price) => enabledCodes.includes(price.currency.toUpperCase()))
    .map((price) => ({
      currency: price.currency.toUpperCase(),
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
    luggageCapacityPerUnit: input.luggageCapacityPerUnit ?? null,
    sortOrder: input.sortOrder,
    isActive: input.isActive,
    prices,
  };
}

function mapLocationTranslations(
  translations: LocaleTranslationMap,
  enabledLocaleCodes: string[],
): LocaleTranslationMap {
  return normalizeLocaleTranslations(translations, enabledLocaleCodes);
}

function resolveParentId(
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

async function assertDistrictFeaturedInput(input: {
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

  const enabledCurrencies = await currencyRepository.listEnabledCodes();

  for (const currency of enabledCurrencies) {
    const priceMajor = input.featuredStartingPrices?.[currency];

    if (priceMajor === undefined || priceMajor <= 0) {
      throw new DomainRuleError("FEATURED_PRICE_REQUIRED");
    }
  }
}

function mapFeaturedStartingPricesToMinor(
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

function buildDistrictFeaturedPayload(input: {
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

export async function loginAction(rawInput: unknown) {
  const parsed = loginSchema.safeParse(rawInput);

  if (!parsed.success) {
    return failure({
      code: "VALIDATION_ERROR",
      message: "Doğrulama başarısız",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<
        string,
        string[]
      >,
    });
  }

  try {
    await authenticateAdmin(parsed.data.email, parsed.data.password);
  } catch (error) {
    return failure(toPublicError(error));
  }

  redirect("/admin");
}

export async function logoutAction() {
  await deleteSession();
  redirect("/admin/login");
}

export async function createLocationAction(rawInput: unknown) {
  return createAction(locationSchema, async (input) => {
    await assertDistrictFeaturedInput(input);
    const enabledLocaleCodes = await localeRepository.listActiveCodes();
    const featuredPayload = buildDistrictFeaturedPayload(input);
    const location = await locationAdminRepository.create({
      type: input.type,
      code: input.code.toUpperCase(),
      translations: mapLocationTranslations(
        input.translations,
        enabledLocaleCodes,
      ),
      parentId: resolveParentId(input),
      address: input.address ?? null,
      latitude: input.latitude ?? null,
      longitude: input.longitude ?? null,
      sortOrder: input.sortOrder,
      isActive: input.isActive,
      ...featuredPayload,
    });

    revalidatePath("/admin/locations");
    revalidatePath("/");
    return location;
  }, rawInput);
}

export async function updateLocationAction(rawInput: unknown) {
  return createAction(updateLocationSchema, async (input) => {
    const { id, type, parentId, translations, ...rest } = input;
    const existing = await locationAdminRepository.findById(id);
    const resolvedType = type ?? existing?.type;

    if (!resolvedType || !existing) {
      throw new DomainRuleError("LOCATION_NOT_FOUND");
    }

    const existingFeaturedPricesMajor = Object.fromEntries(
      Object.entries(existing.featuredStartingPrices).map(
        ([currency, amountMinor]) => [currency, minorToMajor(amountMinor)],
      ),
    );

    await assertDistrictFeaturedInput({
      type: resolvedType,
      isFeaturedOnHomepage:
        rest.isFeaturedOnHomepage ?? existing.isFeaturedOnHomepage ?? false,
      imageKey:
        rest.imageKey !== undefined ? rest.imageKey : existing.imageKey ?? null,
      featuredStartingPrices:
        rest.featuredStartingPrices ?? existingFeaturedPricesMajor,
    });

    const enabledLocaleCodes = await localeRepository.listActiveCodes();
    const featuredPayload =
      resolvedType === "DISTRICT"
        ? buildDistrictFeaturedPayload({
            type: resolvedType,
            imageKey:
              rest.imageKey !== undefined
                ? rest.imageKey
                : existing.imageKey ?? null,
            isFeaturedOnHomepage:
              rest.isFeaturedOnHomepage ?? existing.isFeaturedOnHomepage ?? false,
            featuredStartingPrices:
              rest.featuredStartingPrices ?? existingFeaturedPricesMajor,
          })
        : {};

    const location = await locationAdminRepository.update(id, {
      ...rest,
      type,
      code: rest.code?.toUpperCase(),
      translations:
        translations !== undefined
          ? mapLocationTranslations(translations, enabledLocaleCodes)
          : undefined,
      parentId:
        type === "CITY"
          ? null
          : parentId !== undefined
            ? parentId
            : undefined,
      ...featuredPayload,
    });

    revalidatePath("/admin/locations");
    revalidatePath("/");
    revalidatePath(`/admin/locations/${location.type.toLowerCase()}/${id}/edit`);
    return location;
  }, rawInput);
}

export async function deactivateLocationAction(rawInput: unknown) {
  return createAction(
    z.object({ id: z.string().uuid() }),
    async (input) => {
      await locationAdminRepository.deactivate(input.id);
      revalidatePath("/admin/locations");
      return { success: true };
    },
    rawInput,
  );
}

export async function updateRoutePricesAction(rawInput: unknown) {
  return createAction(priceUpdateSchema, async (input) => {
    const enabledCodes = await currencyRepository.listEnabledCodes();

    const prices: UpsertRoutePriceInput[] = input.prices
      .filter((price) => {
        const normalized = price.currency.toUpperCase();
        return (
          isSupportedCurrencyCode(normalized) &&
          enabledCodes.includes(normalized)
        );
      })
      .map((price) => ({
        districtId: price.districtId,
        vehicleCategoryId: price.vehicleCategoryId,
        currency: price.currency.toUpperCase(),
        oneWayPriceMinor: Math.round(price.oneWayPriceMajor * 100),
        roundTripPriceMinor:
          price.roundTripPriceMajor === null ||
          price.roundTripPriceMajor === undefined
            ? null
            : Math.round(price.roundTripPriceMajor * 100),
      }));

    await pricingAdminRepository.upsertRoutePrices(input.airportId, prices);
    revalidatePath("/admin/pricing");
    return { success: true };
  }, rawInput);
}

export async function updateEnabledCurrenciesAction(rawInput: unknown) {
  return createAction(enabledCurrenciesSchema, async (input) => {
    const currencies = input.codes
      .map((code) => code.toUpperCase())
      .filter(isSupportedCurrencyCode)
      .map((code) => {
        const supported = findSupportedCurrency(code)!;
        return { code: supported.code, label: supported.label };
      });

    if (currencies.length === 0) {
      throw new DomainRuleError("En az bir para birimi seçmelisiniz");
    }

    await currencyRepository.setEnabled(currencies);
    revalidatePath("/admin/currencies");
    revalidatePath("/admin/pricing");
    return { success: true };
  }, rawInput);
}

export async function createExtraAction(rawInput: unknown) {
  return createAction(extraSchema, async (input) => {
    const [enabledCodes, enabledLocaleCodes] = await Promise.all([
      currencyRepository.listEnabledCodes(),
      localeRepository.listActiveCodes(),
    ]);
    const extra = await extraAdminRepository.create(
      mapExtraInput(input, enabledCodes, enabledLocaleCodes),
    );
    revalidatePath("/admin/extras");
    return extra;
  }, rawInput);
}

export async function updateExtraAction(rawInput: unknown) {
  return createAction(updateExtraSchema, async (input) => {
    const [enabledCodes, enabledLocaleCodes] = await Promise.all([
      currencyRepository.listEnabledCodes(),
      localeRepository.listActiveCodes(),
    ]);
    const { id, ...rest } = input;
    const extra = await extraAdminRepository.update(
      id,
      mapExtraInput(rest, enabledCodes, enabledLocaleCodes),
    );
    revalidatePath("/admin/extras");
    revalidatePath(`/admin/extras/${id}/edit`);
    return extra;
  }, rawInput);
}

export async function updateContactChannelsAction(rawInput: unknown) {
  return createAction(syncContactChannelsSchema, async (input) => {
    const channels = await contactChannelRepository.sync(
      assignContactSortOrders(input.channels),
    );
    revalidatePath("/admin/contact");
    return channels;
  }, rawInput);
}

export async function updateEnabledLocalesAction(rawInput: unknown) {
  return createAction(syncEnabledLocalesSchema, async (input) => {
    const locales = await localeRepository.sync(mapEnabledLocales(input));
    revalidatePath("/admin/locales");
    revalidatePath("/[locale]", "layout");
    return locales;
  }, rawInput);
}

export async function createVehicleAction(rawInput: unknown) {
  return createAction(vehicleSchema, async (input) => {
    const enabledLocaleCodes = await localeRepository.listActiveCodes();
    const vehicle = await vehicleAdminRepository.create(
      mapVehicleInput(input, enabledLocaleCodes),
    );
    revalidatePath("/admin/vehicles");
    revalidatePath("/admin/pricing");
    return vehicle;
  }, rawInput);
}

export async function updateVehicleAction(rawInput: unknown) {
  return createAction(updateVehicleSchema, async (input) => {
    const enabledLocaleCodes = await localeRepository.listActiveCodes();
    const { id, ...rest } = input;
    const vehicle = await vehicleAdminRepository.update(
      id,
      mapVehicleInput(rest, enabledLocaleCodes),
    );
    revalidatePath("/admin/vehicles");
    revalidatePath(`/admin/vehicles/${id}/edit`);
    revalidatePath("/admin/pricing");
    return vehicle;
  }, rawInput);
}

export async function deactivateVehicleAction(rawInput: unknown) {
  return createAction(
    z.object({ id: z.string().uuid() }),
    async (input) => {
      await vehicleAdminRepository.deactivate(input.id);
      revalidatePath("/admin/vehicles");
      revalidatePath("/admin/pricing");
      return { success: true };
    },
    rawInput,
  );
}
