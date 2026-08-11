"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db/client";
import { ExtraAdminRepository } from "@/features/admin/server/extra-admin-repository";
import { LocaleRepository } from "@/features/locales/server/repository";
import { createAction } from "@/server/action";
import { extraSchema, mapExtraInput, updateExtraSchema } from "./shared";

const extraAdminRepository = new ExtraAdminRepository(db);
const localeRepository = new LocaleRepository(db);

export async function createExtraAction(rawInput: unknown) {
  return createAction(extraSchema, async (input) => {
    const enabledLocaleCodes = await localeRepository.listActiveCodes();
    const extra = await extraAdminRepository.create(
      mapExtraInput(input, enabledLocaleCodes),
    );
    revalidatePath("/admin/extras");
    return extra;
  }, rawInput);
}

export async function updateExtraAction(rawInput: unknown) {
  return createAction(updateExtraSchema, async (input) => {
    const enabledLocaleCodes = await localeRepository.listActiveCodes();
    const { id, ...rest } = input;
    const extra = await extraAdminRepository.update(
      id,
      mapExtraInput(rest, enabledLocaleCodes),
    );
    revalidatePath("/admin/extras");
    revalidatePath(`/admin/extras/${id}/edit`);
    return extra;
  }, rawInput);
}

export async function deleteExtraAction(rawInput: unknown) {
  return createAction(
    z.object({ id: z.string().uuid() }),
    async (input) => {
      const result = await extraAdminRepository.delete(input.id);
      revalidatePath("/admin/extras");
      return { result };
    },
    rawInput,
  );
}
