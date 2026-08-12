import { getTranslations } from "next-intl/server";

import { BLOG_PAGE_IMAGES } from "@/config/blog-images";
import type { BlogPostDefinition } from "@/content/blog/types";
import {
  getBlogLocaleContent,
  resolveBlogContentLocale,
} from "@/content/blog/registry";
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
  const content = getBlogLocaleContent(post, locale);
  const contentLocale = resolveBlogContentLocale(locale);

  return buildPageMetadata({
    locale,
    path: `/blog/${post.slug}`,
    title: content.title,
    description: content.metaDescription,
    enabledLocales,
    image: {
      url: post.coverImage,
      width: 1200,
      height: 800,
      alt: post.coverImageAlt[contentLocale],
    },
  });
}
