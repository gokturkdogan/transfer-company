"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { DEFAULT_LOCALE } from "@/config/constants";
import { isSupportedLocaleCode } from "@/config/locales";
import { db } from "@/db/client";
import {
  LocaleRepository,
  type UpsertEnabledLocaleInput,
} from "@/features/locales/server/repository";
import { createAction } from "@/server/action";
import { revalidatePublicCatalogCache } from "@/server/cache/revalidate-tags";
import { DomainRuleError } from "@/server/errors";

const localeRepository = new LocaleRepository(db);

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

export async function updateEnabledLocalesAction(rawInput: unknown) {
  return createAction(syncEnabledLocalesSchema, async (input) => {
    const locales = await localeRepository.sync(mapEnabledLocales(input));
    revalidatePath("/admin/locales");
    revalidatePath("/[locale]", "layout");
    revalidatePublicCatalogCache();
    return locales;
  }, rawInput);
}
