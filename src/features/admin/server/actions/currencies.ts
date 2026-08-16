"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  findCashPaymentCurrency,
  isCashPaymentCurrencyCode,
} from "@/config/currencies";
import { db } from "@/db/client";
import { CurrencyRepository } from "@/features/currencies/server/repository";
import { createAction } from "@/server/action";
import { revalidatePublicCatalogCache } from "@/server/cache/revalidate-tags";

const currencyRepository = new CurrencyRepository(db);

const enabledCurrenciesSchema = z.object({
  codes: z.array(z.string().length(3)),
});

export async function updateEnabledCurrenciesAction(rawInput: unknown) {
  return createAction(enabledCurrenciesSchema, async (input) => {
    const currencies = input.codes
      .map((code) => code.toUpperCase())
      .filter(isCashPaymentCurrencyCode)
      .map((code) => {
        const supported = findCashPaymentCurrency(code)!;
        return { code: supported.code, label: supported.label };
      });

    await currencyRepository.setEnabled(currencies);
    revalidatePath("/admin/currencies");
    revalidatePath("/", "layout");
    revalidatePublicCatalogCache();
    return { success: true };
  }, rawInput);
}
