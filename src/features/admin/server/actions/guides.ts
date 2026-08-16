"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";

import { DEFAULT_LOCALE } from "@/config/constants";
import { isSupportedLocaleCode } from "@/config/locales";
import { db } from "@/db/client";
import {
  blogLocaleContentSchema,
} from "@/features/blog/domain/schemas";
import { BlogPostRepository } from "@/features/blog/server/repository";
import { LocaleRepository } from "@/features/locales/server/repository";
import { createAction } from "@/server/action";
import { DomainRuleError } from "@/server/errors";

const blogPostRepository = new BlogPostRepository(db);
const localeRepository = new LocaleRepository(db);

const slugSchema = z
  .string()
  .trim()
  .min(2)
  .max(120)
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Slug yalnızca küçük harf, rakam ve tire içerebilir",
  );

const guideTranslationSchema = blogLocaleContentSchema.extend({
  locale: z.string().trim().min(2).max(5),
});

const guideBaseSchema = z.object({
  slug: slugSchema,
  publishedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  coverImageUrl: z.string().trim().url(),
  transferDistrictCode: z
    .string()
    .trim()
    .max(32)
    .optional()
    .nullable()
    .transform((value) => value?.trim() || null),
  sortOrder: z.coerce.number().int().min(0).max(9999),
  isActive: z.boolean(),
  translations: z.array(guideTranslationSchema).min(1),
});

const updateGuideSchema = guideBaseSchema.extend({
  id: z.string().uuid(),
});

function mapTranslations(
  translations: z.infer<typeof guideTranslationSchema>[],
): Record<string, z.infer<typeof blogLocaleContentSchema>> {
  return Object.fromEntries(
    translations.map((item) => [
      item.locale,
      {
        title: item.title,
        metaDescription: item.metaDescription,
        excerpt: item.excerpt,
        readingMinutes: item.readingMinutes,
        intro: item.intro,
        pullQuote: item.pullQuote,
        coverImageAlt: item.coverImageAlt,
        sections: item.sections,
        tips: item.tips,
        faq: item.faq,
      },
    ]),
  );
}

function assertGuideTranslations(
  data: z.infer<typeof guideBaseSchema>,
  enabledLocaleCodes: readonly string[],
): void {
  const issues: z.ZodIssue[] = [];

  data.translations.forEach((translation, index) => {
    if (!isSupportedLocaleCode(translation.locale)) {
      issues.push({
        code: z.ZodIssueCode.custom,
        message: "Geçersiz dil kodu",
        path: ["translations", index, "locale"],
      });
    }

    if (!enabledLocaleCodes.includes(translation.locale)) {
      issues.push({
        code: z.ZodIssueCode.custom,
        message: "Pasif dil için içerik gönderilemez",
        path: ["translations", index, "locale"],
      });
    }
  });

  const defaultTranslation = data.translations.find(
    (item) => item.locale === DEFAULT_LOCALE,
  );

  if (!defaultTranslation) {
    issues.push({
      code: z.ZodIssueCode.custom,
      message: "Varsayılan dil içeriği zorunludur",
      path: ["translations"],
    });
  }

  if (data.isActive && !defaultTranslation?.title.trim()) {
    issues.push({
      code: z.ZodIssueCode.custom,
      message: "Aktif rehber için varsayılan dilde başlık zorunludur",
      path: ["translations"],
    });
  }

  if (issues.length > 0) {
    throw new z.ZodError(issues);
  }
}

export async function createGuideAction(rawInput: unknown) {
  return createAction(guideBaseSchema, async (input) => {
    const enabledLocaleCodes = await localeRepository.listActiveCodes();
    assertGuideTranslations(input, enabledLocaleCodes);

    if (await blogPostRepository.slugExists(input.slug)) {
      throw new DomainRuleError("GUIDE_SLUG_EXISTS");
    }

    const guide = await blogPostRepository.create({
      slug: input.slug,
      publishedAt: input.publishedAt,
      coverImageUrl: input.coverImageUrl,
      transferDistrictCode: input.transferDistrictCode,
      sortOrder: input.sortOrder,
      isActive: input.isActive,
      translations: mapTranslations(input.translations),
    });

    revalidateBlog();

    return guide;
  }, rawInput);
}

export async function updateGuideAction(rawInput: unknown) {
  return createAction(updateGuideSchema, async (input) => {
    const enabledLocaleCodes = await localeRepository.listActiveCodes();
    assertGuideTranslations(input, enabledLocaleCodes);

    if (await blogPostRepository.slugExists(input.slug, input.id)) {
      throw new DomainRuleError("GUIDE_SLUG_EXISTS");
    }

    const guide = await blogPostRepository.update({
      id: input.id,
      slug: input.slug,
      publishedAt: input.publishedAt,
      coverImageUrl: input.coverImageUrl,
      transferDistrictCode: input.transferDistrictCode,
      sortOrder: input.sortOrder,
      isActive: input.isActive,
      translations: mapTranslations(input.translations),
    });

    revalidateBlog(input.slug);

    return guide;
  }, rawInput);
}

export async function deleteGuideAction(rawInput: unknown) {
  return createAction(
    z.object({ id: z.string().uuid() }),
    async (input) => {
      await blogPostRepository.softDelete(input.id);
      revalidateBlog();
      return { success: true };
    },
    rawInput,
  );
}

function revalidateBlog(slug?: string) {
  revalidatePath("/admin/guides");
  revalidateTag("blog-posts", "max");
  revalidatePath("/sitemap.xml");

  if (slug) {
    revalidatePath(`/blog/${slug}`);
  }

  revalidatePath("/blog");
}
