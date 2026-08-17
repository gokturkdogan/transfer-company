"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import { isSupportedLocaleCode } from "@/config/locales";
import { db } from "@/db/client";
import { updatePrivacyPageSchema } from "@/features/privacy/domain/schemas";
import { PrivacyPageRepository } from "@/features/privacy/server/repository";
import { PRIVACY_PAGE_CACHE_TAG } from "@/server/cache/revalidate-tags";
import { createAction } from "@/server/action";

const privacyPageRepository = new PrivacyPageRepository(db);

const validatedUpdatePrivacyPageSchema = updatePrivacyPageSchema.superRefine(
  (data, ctx) => {
    data.translations.forEach((translation, index) => {
      if (!isSupportedLocaleCode(translation.locale)) {
        ctx.addIssue({
          code: "custom",
          message: "Geçersiz dil kodu",
          path: ["translations", index, "locale"],
        });
      }
    });
  },
);

export async function updatePrivacyPageAction(rawInput: unknown) {
  return createAction(validatedUpdatePrivacyPageSchema, async (input) => {
    const translations = await privacyPageRepository.upsertAll(input.translations);

    revalidatePath("/admin/privacy");
    revalidateTag(PRIVACY_PAGE_CACHE_TAG, "max");

    for (const translation of input.translations) {
      revalidateTag(`${PRIVACY_PAGE_CACHE_TAG}:${translation.locale}`, "max");
    }

    return translations;
  }, rawInput);
}
