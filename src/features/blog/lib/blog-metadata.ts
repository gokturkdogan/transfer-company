import { getTranslations } from "next-intl/server";

import {
  BLOG_COVER_OG_HEIGHT,
  BLOG_COVER_OG_WIDTH,
} from "@/config/blog-cover";
import { BLOG_PAGE_IMAGES } from "@/config/blog-images";
import type { BlogPostDefinition } from "@/content/blog/types";
import {
  resolveBlogCoverImageAlt,
  resolveBlogLocaleContent,
} from "@/features/blog/domain/resolve-locale-content";
import { buildPageMetadata } from "@/lib/seo/metadata";

export async function buildBlogHubMetadata(
  locale: string,
  enabledLocales: readonly string[],
) {
  const t = await getTranslations({ locale, namespace: "blog.hub" });

  return buildPageMetadata({
    locale,
    path: "/blog",
    title: t("metaTitle"),
    description: t("metaDescription"),
    enabledLocales,
    image: {
      url: BLOG_PAGE_IMAGES.hero,
      width: 1920,
      height: 1080,
      alt: t("metaTitle"),
    },
  });
}

export async function buildBlogArticleMetadata(
  locale: string,
  post: BlogPostDefinition,
  enabledLocales: readonly string[],
) {
  const { content } = resolveBlogLocaleContent(post.content, locale);
  const coverImageAlt = resolveBlogCoverImageAlt(post.coverImageAlt, locale);

  return buildPageMetadata({
    locale,
    path: `/blog/${post.slug}`,
    title: content.title,
    description: content.metaDescription,
    enabledLocales,
    image: {
      url: post.coverImage,
      width: BLOG_COVER_OG_WIDTH,
      height: BLOG_COVER_OG_HEIGHT,
      alt: coverImageAlt,
    },
  });
}
