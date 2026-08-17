import { z } from "zod";

import { DEFAULT_LOCALE } from "@/config/constants";
import { sanitizePrivacyHtml } from "@/features/privacy/lib/sanitize-privacy-html";

const PRIVACY_CONTENT_MAX_LENGTH = 200_000;

export const privacyLocaleContentSchema = z.object({
  locale: z.string().trim().min(2).max(5),
  content: z
    .string()
    .trim()
    .max(PRIVACY_CONTENT_MAX_LENGTH)
    .transform(sanitizePrivacyHtml),
});

export const updatePrivacyPageSchema = z
  .object({
    translations: z.array(privacyLocaleContentSchema).min(1),
  })
  .superRefine((data, ctx) => {
    const defaultTranslation = data.translations.find(
      (item) => item.locale === DEFAULT_LOCALE,
    );

    if (!defaultTranslation) {
      ctx.addIssue({
        code: "custom",
        message: "Türkçe içerik zorunludur",
        path: ["translations"],
      });
      return;
    }

    const plainText = defaultTranslation.content
      .replace(/<[^>]+>/g, "")
      .replace(/\s+/g, "")
      .trim();

    if (!plainText) {
      ctx.addIssue({
        code: "custom",
        message: "Türkçe aydınlatma metni boş olamaz",
        path: ["translations"],
      });
    }
  });

export type PrivacyLocaleContentInput = z.infer<typeof privacyLocaleContentSchema>;

export type PrivacyPageContent = {
  content: string;
};
