import "server-only";

import { and, asc, desc, eq, inArray, isNull } from "drizzle-orm";

import { DEFAULT_LOCALE } from "@/config/constants";
import type {
  BlogLocaleContent,
  BlogPostDefinition,
  BlogPostSummary,
} from "@/content/blog/types";
import type { Database } from "@/db/client";
import { blogPostTranslations, blogPosts } from "@/db/schema";
import type {
  BlogFaqItemInput,
  BlogLocaleContentInput,
  BlogSectionInput,
} from "@/features/blog/domain/schemas";

type BlogTranslationRow = {
  id: string;
  postId: string;
  locale: string;
  title: string;
  metaDescription: string;
  excerpt: string;
  readingMinutes: number;
  intro: string;
  pullQuote: string | null;
  coverImageAlt: string;
  sections: BlogSectionInput[];
  tips: string[];
  faq: BlogFaqItemInput[];
};

export type AdminGuideRecord = {
  id: string;
  slug: string;
  publishedAt: string;
  coverImageUrl: string;
  transferDistrictCode: string | null;
  sortOrder: number;
  isActive: boolean;
  title: string;
};

export type AdminGuideDetailRecord = AdminGuideRecord & {
  translations: Record<string, BlogLocaleContentInput>;
};

export type CreateGuideInput = {
  slug: string;
  publishedAt: string;
  coverImageUrl: string;
  transferDistrictCode?: string | null;
  sortOrder: number;
  isActive: boolean;
  translations: Record<string, BlogLocaleContentInput>;
};

export type UpdateGuideInput = CreateGuideInput & {
  id: string;
};

function parseJsonArray<T>(value: unknown, fallback: T[]): T[] {
  if (Array.isArray(value)) {
    return value as T[];
  }

  return fallback;
}

function mapTranslationRow(row: BlogTranslationRow): BlogLocaleContentInput {
  return {
    title: row.title,
    metaDescription: row.metaDescription,
    excerpt: row.excerpt,
    readingMinutes: row.readingMinutes,
    intro: row.intro,
    pullQuote: row.pullQuote ?? undefined,
    coverImageAlt: row.coverImageAlt,
    sections: parseJsonArray(row.sections, []),
    tips: parseJsonArray(row.tips, []),
    faq: parseJsonArray(row.faq, []),
  };
}

function mapToLocaleContent(input: BlogLocaleContentInput): BlogLocaleContent {
  return {
    title: input.title,
    metaDescription: input.metaDescription,
    excerpt: input.excerpt,
    readingMinutes: input.readingMinutes,
    intro: input.intro,
    sections: input.sections,
    pullQuote: input.pullQuote,
    tips: input.tips?.length ? input.tips : undefined,
    faq: input.faq?.length ? input.faq : undefined,
  };
}

function mapToDefinition(
  post: {
    slug: string;
    publishedAt: string;
    coverImageUrl: string;
    transferDistrictCode: string | null;
  },
  translations: BlogTranslationRow[],
): BlogPostDefinition {
  const content: Record<string, BlogLocaleContent> = {};
  const coverImageAlt: Record<string, string> = {};

  for (const translation of translations) {
    const mapped = mapTranslationRow(translation);
    content[translation.locale] = mapToLocaleContent(mapped);
    coverImageAlt[translation.locale] = mapped.coverImageAlt;
  }

  return {
    slug: post.slug,
    publishedAt: post.publishedAt,
    coverImage: post.coverImageUrl,
    coverImageAlt,
    transferDistrictCode: post.transferDistrictCode ?? undefined,
    content,
  };
}

function isDisplayablePost(post: {
  isActive: boolean;
  coverImageUrl: string;
  translations: BlogTranslationRow[];
}): boolean {
  return (
    post.isActive &&
    post.coverImageUrl.trim().length > 0 &&
    post.translations.some((translation) => translation.title.trim().length > 0)
  );
}

export class BlogPostRepository {
  constructor(private readonly database: Database) {}

  private async loadTranslations(postIds: string[]): Promise<BlogTranslationRow[]> {
    if (postIds.length === 0) {
      return [];
    }

    const rows = await this.database
      .select({
        id: blogPostTranslations.id,
        postId: blogPostTranslations.postId,
        locale: blogPostTranslations.locale,
        title: blogPostTranslations.title,
        metaDescription: blogPostTranslations.metaDescription,
        excerpt: blogPostTranslations.excerpt,
        readingMinutes: blogPostTranslations.readingMinutes,
        intro: blogPostTranslations.intro,
        pullQuote: blogPostTranslations.pullQuote,
        coverImageAlt: blogPostTranslations.coverImageAlt,
        sections: blogPostTranslations.sections,
        tips: blogPostTranslations.tips,
        faq: blogPostTranslations.faq,
      })
      .from(blogPostTranslations)
      .where(inArray(blogPostTranslations.postId, postIds));

    return rows.map((row) => ({
      ...row,
      sections: parseJsonArray(row.sections, []),
      tips: parseJsonArray(row.tips, []),
      faq: parseJsonArray(row.faq, []),
    }));
  }

  async listActiveSummaries(locale: string): Promise<BlogPostSummary[]> {
    const posts = await this.database
      .select({
        id: blogPosts.id,
        slug: blogPosts.slug,
        publishedAt: blogPosts.publishedAt,
        coverImageUrl: blogPosts.coverImageUrl,
        transferDistrictCode: blogPosts.transferDistrictCode,
        isActive: blogPosts.isActive,
      })
      .from(blogPosts)
      .where(and(eq(blogPosts.isActive, true), isNull(blogPosts.deletedAt)))
      .orderBy(asc(blogPosts.sortOrder), desc(blogPosts.publishedAt));

    const translations = await this.loadTranslations(posts.map((post) => post.id));
    const translationsByPost = new Map<string, BlogTranslationRow[]>();

    for (const translation of translations) {
      const list = translationsByPost.get(translation.postId) ?? [];
      list.push(translation);
      translationsByPost.set(translation.postId, list);
    }

    const summaries: BlogPostSummary[] = [];

    for (const post of posts) {
      const postTranslations = translationsByPost.get(post.id) ?? [];

      if (
        !isDisplayablePost({
          isActive: post.isActive,
          coverImageUrl: post.coverImageUrl,
          translations: postTranslations,
        })
      ) {
        continue;
      }

      const definition = mapToDefinition(post, postTranslations);
      const { content, contentLocale } = resolveSummaryLocale(definition, locale);

      summaries.push({
        slug: definition.slug,
        publishedAt: definition.publishedAt,
        coverImage: definition.coverImage,
        coverImageAlt: definition.coverImageAlt[contentLocale] ?? "",
        title: content.title,
        excerpt: content.excerpt,
        readingMinutes: content.readingMinutes,
      });
    }

    return summaries;
  }

  async getActiveBySlug(slug: string): Promise<BlogPostDefinition | null> {
    const [post] = await this.database
      .select({
        slug: blogPosts.slug,
        publishedAt: blogPosts.publishedAt,
        coverImageUrl: blogPosts.coverImageUrl,
        transferDistrictCode: blogPosts.transferDistrictCode,
        isActive: blogPosts.isActive,
        id: blogPosts.id,
      })
      .from(blogPosts)
      .where(
        and(
          eq(blogPosts.slug, slug),
          eq(blogPosts.isActive, true),
          isNull(blogPosts.deletedAt),
        ),
      )
      .limit(1);

    if (!post) {
      return null;
    }

    const translations = await this.loadTranslations([post.id]);

    if (
      !isDisplayablePost({
        isActive: post.isActive,
        coverImageUrl: post.coverImageUrl,
        translations,
      })
    ) {
      return null;
    }

    return mapToDefinition(post, translations);
  }

  async listAllSlugs(): Promise<string[]> {
    const rows = await this.database
      .select({ slug: blogPosts.slug })
      .from(blogPosts)
      .where(and(eq(blogPosts.isActive, true), isNull(blogPosts.deletedAt)))
      .orderBy(asc(blogPosts.sortOrder), desc(blogPosts.publishedAt));

    return rows.map((row) => row.slug);
  }

  async listFeaturedSummaries(
    locale: string,
    limit = 3,
  ): Promise<Array<{ slug: string; title: string }>> {
    const summaries = await this.listActiveSummaries(locale);

    return summaries.slice(0, limit).map((summary) => ({
      slug: summary.slug,
      title: summary.title,
    }));
  }

  async listForAdmin(): Promise<AdminGuideRecord[]> {
    const posts = await this.database
      .select({
        id: blogPosts.id,
        slug: blogPosts.slug,
        publishedAt: blogPosts.publishedAt,
        coverImageUrl: blogPosts.coverImageUrl,
        transferDistrictCode: blogPosts.transferDistrictCode,
        sortOrder: blogPosts.sortOrder,
        isActive: blogPosts.isActive,
      })
      .from(blogPosts)
      .where(isNull(blogPosts.deletedAt))
      .orderBy(asc(blogPosts.sortOrder), desc(blogPosts.publishedAt));

    const translations = await this.loadTranslations(posts.map((post) => post.id));
    const titleByPost = new Map<string, string>();

    for (const post of posts) {
      const postTranslations = translations.filter(
        (translation) => translation.postId === post.id,
      );
      const defaultTranslation =
        postTranslations.find((item) => item.locale === DEFAULT_LOCALE) ??
        postTranslations[0];
      titleByPost.set(post.id, defaultTranslation?.title ?? post.slug);
    }

    return posts.map((post) => ({
      id: post.id,
      slug: post.slug,
      publishedAt: post.publishedAt,
      coverImageUrl: post.coverImageUrl,
      transferDistrictCode: post.transferDistrictCode,
      sortOrder: post.sortOrder,
      isActive: post.isActive,
      title: titleByPost.get(post.id) ?? post.slug,
    }));
  }

  async getByIdForAdmin(id: string): Promise<AdminGuideDetailRecord | null> {
    const [post] = await this.database
      .select({
        id: blogPosts.id,
        slug: blogPosts.slug,
        publishedAt: blogPosts.publishedAt,
        coverImageUrl: blogPosts.coverImageUrl,
        transferDistrictCode: blogPosts.transferDistrictCode,
        sortOrder: blogPosts.sortOrder,
        isActive: blogPosts.isActive,
      })
      .from(blogPosts)
      .where(and(eq(blogPosts.id, id), isNull(blogPosts.deletedAt)))
      .limit(1);

    if (!post) {
      return null;
    }

    const translations = await this.loadTranslations([post.id]);
    const translationMap: Record<string, BlogLocaleContentInput> = {};

    for (const translation of translations) {
      translationMap[translation.locale] = mapTranslationRow(translation);
    }

    const defaultTranslation =
      translations.find((item) => item.locale === DEFAULT_LOCALE) ??
      translations[0];

    return {
      id: post.id,
      slug: post.slug,
      publishedAt: post.publishedAt,
      coverImageUrl: post.coverImageUrl,
      transferDistrictCode: post.transferDistrictCode,
      sortOrder: post.sortOrder,
      isActive: post.isActive,
      title: defaultTranslation?.title ?? post.slug,
      translations: translationMap,
    };
  }

  async slugExists(slug: string, excludeId?: string): Promise<boolean> {
    const rows = await this.database
      .select({ id: blogPosts.id })
      .from(blogPosts)
      .where(and(eq(blogPosts.slug, slug), isNull(blogPosts.deletedAt)))
      .limit(1);

    if (rows.length === 0) {
      return false;
    }

    if (excludeId && rows[0]?.id === excludeId) {
      return false;
    }

    return true;
  }

  async create(input: CreateGuideInput): Promise<AdminGuideDetailRecord> {
    const [created] = await this.database
      .insert(blogPosts)
      .values({
        slug: input.slug,
        publishedAt: input.publishedAt,
        coverImageUrl: input.coverImageUrl,
        transferDistrictCode: input.transferDistrictCode ?? null,
        sortOrder: input.sortOrder,
        isActive: input.isActive,
      })
      .returning({ id: blogPosts.id });

    await this.upsertTranslations(created.id, input.translations);

    const record = await this.getByIdForAdmin(created.id);

    if (!record) {
      throw new Error("Failed to load created guide");
    }

    return record;
  }

  async update(input: UpdateGuideInput): Promise<AdminGuideDetailRecord> {
    await this.database
      .update(blogPosts)
      .set({
        slug: input.slug,
        publishedAt: input.publishedAt,
        coverImageUrl: input.coverImageUrl,
        transferDistrictCode: input.transferDistrictCode ?? null,
        sortOrder: input.sortOrder,
        isActive: input.isActive,
        deletedAt: null,
      })
      .where(eq(blogPosts.id, input.id));

    await this.upsertTranslations(input.id, input.translations);

    const record = await this.getByIdForAdmin(input.id);

    if (!record) {
      throw new Error("Failed to load updated guide");
    }

    return record;
  }

  async softDelete(id: string): Promise<void> {
    await this.database
      .update(blogPosts)
      .set({
        isActive: false,
        deletedAt: new Date(),
      })
      .where(eq(blogPosts.id, id));
  }

  private async upsertTranslations(
    postId: string,
    translations: Record<string, BlogLocaleContentInput>,
  ): Promise<void> {
    for (const [locale, translation] of Object.entries(translations)) {
      const [existing] = await this.database
        .select({ id: blogPostTranslations.id })
        .from(blogPostTranslations)
        .where(
          and(
            eq(blogPostTranslations.postId, postId),
            eq(blogPostTranslations.locale, locale),
          ),
        )
        .limit(1);

      const values = {
        title: translation.title,
        metaDescription: translation.metaDescription,
        excerpt: translation.excerpt,
        readingMinutes: translation.readingMinutes,
        intro: translation.intro,
        pullQuote: translation.pullQuote ?? null,
        coverImageAlt: translation.coverImageAlt,
        sections: translation.sections,
        tips: translation.tips ?? [],
        faq: translation.faq ?? [],
      };

      if (existing) {
        await this.database
          .update(blogPostTranslations)
          .set(values)
          .where(eq(blogPostTranslations.id, existing.id));
        continue;
      }

      await this.database.insert(blogPostTranslations).values({
        postId,
        locale,
        ...values,
      });
    }
  }
}

function resolveSummaryLocale(
  post: BlogPostDefinition,
  locale: string,
): { content: BlogLocaleContent; contentLocale: string } {
  const candidates = [locale, DEFAULT_LOCALE, "en"];

  for (const code of candidates) {
    const content = post.content[code];

    if (content) {
      return { content, contentLocale: code };
    }
  }

  const firstLocale = Object.keys(post.content)[0]!;

  return {
    content: post.content[firstLocale],
    contentLocale: firstLocale,
  };
}
