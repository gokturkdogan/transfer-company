"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { DEFAULT_CURRENCY } from "@/config/constants";
import { db } from "@/db/client";
import {
  PricingAdminRepository,
  type UpsertRoutePriceInput,
} from "@/features/admin/server/pricing-admin-repository";
import { createAction } from "@/server/action";
import { revalidatePublicCatalogCache } from "@/server/cache/revalidate-tags";

const pricingAdminRepository = new PricingAdminRepository(db);

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

export async function updateRoutePricesAction(rawInput: unknown) {
  return createAction(priceUpdateSchema, async (input) => {
    const prices: UpsertRoutePriceInput[] = input.prices
      .filter((price) => price.currency.toUpperCase() === DEFAULT_CURRENCY)
      .map((price) => ({
        districtId: price.districtId,
        vehicleCategoryId: price.vehicleCategoryId,
        currency: DEFAULT_CURRENCY,
        oneWayPriceMinor: Math.round(price.oneWayPriceMajor * 100),
        roundTripPriceMinor:
          price.roundTripPriceMajor === null ||
          price.roundTripPriceMajor === undefined
            ? null
            : Math.round(price.roundTripPriceMajor * 100),
      }));

    await pricingAdminRepository.upsertRoutePrices(input.airportId, prices);
    revalidatePath("/admin/pricing");
    revalidatePublicCatalogCache();
    return { success: true };
  }, rawInput);
}
