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
import { createAction } from "@/server/action";
import { failure } from "@/server/result";
import { toPublicError } from "@/server/errors";

const locationAdminRepository = new LocationAdminRepository(db);
const pricingAdminRepository = new PricingAdminRepository(db);

const adminLocationTypes = ["AIRPORT", "CITY", "DISTRICT", "HOTEL"] as const;

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const locationSchema = z.object({
  type: z.enum(adminLocationTypes),
  code: z.string().min(1).max(64),
  defaultName: z.string().min(1).max(255),
  parentId: z.string().uuid().nullable().optional(),
  cityId: z.string().uuid().optional(),
  address: z.string().max(2000).nullable().optional(),
  latitude: z.coerce.number().min(-90).max(90).nullable().optional(),
  longitude: z.coerce.number().min(-180).max(180).nullable().optional(),
  sortOrder: z.coerce.number().int().min(0).default(0),
  isActive: z.coerce.boolean().default(true),
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
      oneWayPriceMajor: z.coerce.number().min(0),
      roundTripPriceMajor: z.coerce.number().min(0).nullable().optional(),
    }),
  ),
});

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

export async function loginAction(rawInput: unknown) {
  const parsed = loginSchema.safeParse(rawInput);

  if (!parsed.success) {
    return failure({
      code: "VALIDATION_ERROR",
      message: "Validation failed",
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

  redirect("/admin/locations");
}

export async function logoutAction() {
  await deleteSession();
  redirect("/admin/login");
}

export async function createLocationAction(rawInput: unknown) {
  return createAction(locationSchema, async (input) => {
    const location = await locationAdminRepository.create({
      type: input.type,
      code: input.code.toUpperCase(),
      defaultName: input.defaultName,
      parentId: resolveParentId(input),
      address: input.address ?? null,
      latitude: input.latitude ?? null,
      longitude: input.longitude ?? null,
      sortOrder: input.sortOrder,
      isActive: input.isActive,
    });

    revalidatePath("/admin/locations");
    return location;
  }, rawInput);
}

export async function updateLocationAction(rawInput: unknown) {
  return createAction(updateLocationSchema, async (input) => {
    const { id, type, parentId, ...rest } = input;

    const location = await locationAdminRepository.update(id, {
      ...rest,
      type,
      code: rest.code?.toUpperCase(),
      parentId:
        type === "CITY"
          ? null
          : parentId !== undefined
            ? parentId
            : undefined,
    });

    revalidatePath("/admin/locations");
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
    const prices: UpsertRoutePriceInput[] = input.prices.map((price) => ({
      districtId: price.districtId,
      vehicleCategoryId: price.vehicleCategoryId,
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
