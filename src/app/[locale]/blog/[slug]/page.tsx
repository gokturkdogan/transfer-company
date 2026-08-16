import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";

import { BlogArticleView } from "@/components/blog/BlogArticleView";
import { BlogMoreGuides } from "@/components/blog/BlogMoreGuides";
import { MobileContactBar } from "@/components/shared/MobileContactBar";
import { SiteFooter } from "@/components/shared/SiteFooter";
import { SiteHeader } from "@/components/shared/SiteHeader";
import { getTransferPathForPost } from "@/content/blog/registry";
import {
  resolveBlogCoverImageAlt,
  resolveBlogLocaleContent,
} from "@/features/blog/domain/resolve-locale-content";
import { buildBlogArticleMetadata } from "@/features/blog/lib/blog-metadata";
import {
  getCachedBlogPostBySlug,
  getCachedBlogSlugs,
  getCachedBlogSummaries,
} from "@/server/cache/blog-posts";
import { getCachedEnabledLocales } from "@/server/cache/public-catalog";

export const revalidate = 120;

type PageParams = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateStaticParams() {
  const slugs = await getCachedBlogSlugs();

  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = await getCachedBlogPostBySlug(slug);

  if (!post) {
    return {};
  }

  const enabledLocales = await getCachedEnabledLocales();

  return buildBlogArticleMetadata(
    locale,
    post,
    enabledLocales.map((item) => item.code),
  );
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
  const transferHref = getTransferPathForPost(post);

  const [enabledLocales, allSummaries] = await Promise.all([
    getCachedEnabledLocales(),
    getCachedBlogSummaries(locale),
  ]);

  return (
    <>
      <SiteHeader enabledLocales={enabledLocales} />
      <main className="flex flex-1 flex-col pb-20 md:pb-0">
        <BlogArticleView
          post={post}
          content={content}
          coverImageAlt={coverImageAlt}
          transferHref={transferHref}
        />
        <BlogMoreGuides articles={allSummaries} currentSlug={slug} />
      </main>
      <SiteFooter enabledLocales={enabledLocales} />
      <MobileContactBar />
    </>
  );
}
