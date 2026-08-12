import { antalyaArrivalGuidePost } from "@/content/blog/posts/antalya-havalimani-varis-rehberi";
import { belekTransferGuidePost } from "@/content/blog/posts/belek-havalimani-transferi";
import { transferPricingGuidePost } from "@/content/blog/posts/antalya-transfer-fiyatlari";
import type {
  BlogLocaleContent,
  BlogPostDefinition,
  BlogPostSummary,
} from "@/content/blog/types";

export const BLOG_POSTS: BlogPostDefinition[] = [
  antalyaArrivalGuidePost,
  transferPricingGuidePost,
  belekTransferGuidePost,
];

const CONTENT_LOCALES = ["tr", "en"] as const;

export type BlogContentLocale = (typeof CONTENT_LOCALES)[number];

export function resolveBlogContentLocale(locale: string): BlogContentLocale {
  if (locale === "tr") {
    return "tr";
  }

  return "en";
}

export function getBlogPostBySlug(slug: string): BlogPostDefinition | undefined {
  return BLOG_POSTS.find((post) => post.slug === slug);
}

export function getAllBlogSlugs(): string[] {
  return BLOG_POSTS.map((post) => post.slug);
}

export function getBlogLocaleContent(
  post: BlogPostDefinition,
  locale: string,
): BlogLocaleContent {
  const contentLocale = resolveBlogContentLocale(locale);
  return post.content[contentLocale];
}

export function listBlogSummaries(locale: string): BlogPostSummary[] {
  const contentLocale = resolveBlogContentLocale(locale);

  return BLOG_POSTS.map((post) => {
    const content = post.content[contentLocale];

    return {
      slug: post.slug,
      publishedAt: post.publishedAt,
      coverImage: post.coverImage,
      coverImageAlt: post.coverImageAlt[contentLocale],
      title: content.title,
      excerpt: content.excerpt,
      readingMinutes: content.readingMinutes,
    };
  });
}

/** Footer and cross-links: featured guide slugs in display order */
export const FEATURED_BLOG_SLUGS = BLOG_POSTS.map((post) => post.slug);

export function getTransferPathForPost(post: BlogPostDefinition): string | null {
  if (!post.transferDistrictCode) {
    return null;
  }

  return `/transfers/${post.transferDistrictCode.toLowerCase()}`;
}
