import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";

import { BlogArticleView } from "@/components/blog/BlogArticleView";
import { BlogMoreGuides } from "@/components/blog/BlogMoreGuides";
import { MobileContactBar } from "@/components/shared/MobileContactBar";
import { SiteFooter } from "@/components/shared/SiteFooter";
import { SiteHeader } from "@/components/shared/SiteHeader";
import { BlogArticleJsonLd } from "@/components/seo/BlogArticleJsonLd";
import { DEFAULT_LOCALE } from "@/config/constants";
import { listPublishedLocalesForPost } from "@/features/blog/domain/blog-published-locales";
import {
  resolveBlogCoverImageAlt,
  resolveBlogLocaleContent,
} from "@/features/blog/domain/resolve-locale-content";
import { getBookingHrefForPost } from "@/features/blog/lib/booking-path-for-post";
import { buildBlogArticleMetadata } from "@/features/blog/lib/blog-metadata";
import {
  getCachedBlogPostBySlug,
  getCachedBlogSlugs,
  getCachedBlogSummaries,
} from "@/server/cache/blog-posts";
import {
  getCachedDistricts,
  getCachedEnabledLocales,
} from "@/server/cache/public-catalog";

export const revalidate = 120;

type PageParams = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateStaticParams() {
  const [enabledLocales, slugs] = await Promise.all([
    getCachedEnabledLocales(),
    getCachedBlogSlugs(),
  ]);

  const localeCodes =
    enabledLocales.length > 0
      ? enabledLocales.map((locale) => locale.code)
      : [DEFAULT_LOCALE];

  return localeCodes.flatMap((locale) =>
    slugs.map((slug) => ({ locale, slug })),
  );
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = await getCachedBlogPostBySlug(slug);

  if (!post) {
    return {};
  }

  const enabledLocales = await getCachedEnabledLocales();
  const localeCodes = enabledLocales.map((item) => item.code);
  const publishedLocales = listPublishedLocalesForPost(post, localeCodes);

  return buildBlogArticleMetadata(locale, post, publishedLocales);
}

export default async function BlogArticlePage({ params }: PageParams) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const post = await getCachedBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const { content } = resolveBlogLocaleContent(post.content, locale);
  const coverImageAlt = resolveBlogCoverImageAlt(post.coverImageAlt, locale);

  const [enabledLocales, allSummaries, districts] = await Promise.all([
    getCachedEnabledLocales(),
    getCachedBlogSummaries(locale),
    getCachedDistricts(locale),
  ]);

  const districtBookingHref = getBookingHrefForPost(post, districts);

  return (
    <>
      <BlogArticleJsonLd locale={locale} post={post} content={content} />
      <SiteHeader enabledLocales={enabledLocales} />
      <main className="flex flex-1 flex-col pb-20 md:pb-0">
        <BlogArticleView
          post={post}
          content={content}
          coverImageAlt={coverImageAlt}
          districtBookingHref={districtBookingHref}
        />
        <BlogMoreGuides articles={allSummaries} currentSlug={slug} />
      </main>
      <SiteFooter enabledLocales={enabledLocales} />
      <MobileContactBar />
    </>
  );
}
