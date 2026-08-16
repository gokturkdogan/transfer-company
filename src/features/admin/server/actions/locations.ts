"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db/client";
import { LocationAdminRepository } from "@/features/admin/server/location-admin-repository";
import { LocaleRepository } from "@/features/locales/server/repository";
import { createAction } from "@/server/action";
import { revalidatePublicCatalogCache } from "@/server/cache/revalidate-tags";
import { DomainRuleError } from "@/server/errors";
import { minorToMajor } from "@/lib/money";
import {
  assertDistrictFeaturedInput,
  buildDistrictFeaturedPayload,
  locationSchema,
  mapLocationTranslations,
  resolveParentId,
  updateLocationSchema,
} from "./shared";

const locationAdminRepository = new LocationAdminRepository(db);
const localeRepository = new LocaleRepository(db);

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
    revalidatePublicCatalogCache();
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
    revalidatePublicCatalogCache();
    return location;
  }, rawInput);
}

export async function deactivateLocationAction(rawInput: unknown) {
  return createAction(
    z.object({ id: z.string().uuid() }),
    async (input) => {
      await locationAdminRepository.deactivate(input.id);
      revalidatePath("/admin/locations");
      revalidatePublicCatalogCache();
      return { success: true };
    },
    rawInput,
  );
}
