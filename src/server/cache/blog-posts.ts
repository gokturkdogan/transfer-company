import "server-only";

import { unstable_cache } from "next/cache";

import { db } from "@/db/client";
import { BlogPostRepository } from "@/features/blog/server/repository";

const REVALIDATE_SECONDS = 120;

export function getCachedBlogSummaries(locale: string) {
  return unstable_cache(
    async () => new BlogPostRepository(db).listActiveSummaries(locale),
    ["blog-summaries", locale],
    { revalidate: REVALIDATE_SECONDS, tags: ["blog-posts"] },
  )();
}

export function getCachedBlogPostBySlug(slug: string) {
  return unstable_cache(
    async () => new BlogPostRepository(db).getActiveBySlug(slug),
    ["blog-post", slug],
    { revalidate: REVALIDATE_SECONDS, tags: ["blog-posts"] },
  )();
}

export function getCachedBlogSlugs() {
  return unstable_cache(
    async () => new BlogPostRepository(db).listAllSlugs(),
    ["blog-slugs"],
    { revalidate: REVALIDATE_SECONDS, tags: ["blog-posts"] },
  )();
}

export function getCachedFeaturedGuideLinks(locale: string) {
  return unstable_cache(
    async () => new BlogPostRepository(db).listFeaturedSummaries(locale, 3),
    ["blog-featured", locale],
    { revalidate: REVALIDATE_SECONDS, tags: ["blog-posts"] },
  )();
}
