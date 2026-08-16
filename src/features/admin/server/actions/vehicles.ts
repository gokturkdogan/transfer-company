"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db/client";
import {
  VehicleAdminRepository,
} from "@/features/admin/server/vehicle-admin-repository";
import { LocaleRepository } from "@/features/locales/server/repository";
import { createAction } from "@/server/action";
import { revalidatePublicCatalogCache } from "@/server/cache/revalidate-tags";
import {
  mapVehicleInput,
  updateVehicleSchema,
  vehicleSchema,
} from "./shared";

const vehicleAdminRepository = new VehicleAdminRepository(db);
const localeRepository = new LocaleRepository(db);

export async function createVehicleAction(rawInput: unknown) {
  return createAction(vehicleSchema, async (input) => {
    const enabledLocaleCodes = await localeRepository.listActiveCodes();
    const vehicle = await vehicleAdminRepository.create(
      mapVehicleInput(input, enabledLocaleCodes),
    );
    revalidatePath("/admin/vehicles");
    revalidatePath("/admin/pricing");
    revalidatePublicCatalogCache();
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
    revalidatePublicCatalogCache();
    return vehicle;
  }, rawInput);
}

export async function deleteVehicleAction(rawInput: unknown) {
  return createAction(
    z.object({ id: z.string().uuid() }),
    async (input) => {
      const result = await vehicleAdminRepository.delete(input.id);
      revalidatePath("/admin/vehicles");
      revalidatePath("/admin/pricing");
      revalidatePath("/", "layout");
      revalidatePublicCatalogCache();
      return { result };
    },
    rawInput,
  );
}

export async function deactivateVehicleAction(rawInput: unknown) {
  return createAction(
    z.object({ id: z.string().uuid() }),
    async (input) => {
      await vehicleAdminRepository.deactivate(input.id);
      revalidatePath("/admin/vehicles");
      revalidatePath("/admin/pricing");
      revalidatePublicCatalogCache();
      return { success: true };
    },
    rawInput,
  );
}
