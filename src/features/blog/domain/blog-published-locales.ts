import type { BlogPostDefinition } from "@/content/blog/types";

export function listPublishedLocalesForPost(
  post: BlogPostDefinition,
  enabledLocales: readonly string[],
): string[] {
  const contentLocales = new Set(Object.keys(post.content));

  return enabledLocales.filter((locale) => contentLocales.has(locale));
}
