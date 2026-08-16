import type { BlogLocaleContent } from "@/content/blog/types";

const FALLBACK_LOCALES = ["tr", "en"] as const;

export function resolveBlogLocaleContent(
  contentByLocale: Record<string, BlogLocaleContent>,
  locale: string,
): { content: BlogLocaleContent; contentLocale: string } {
  const candidates = [locale, ...FALLBACK_LOCALES];

  for (const code of candidates) {
    const content = contentByLocale[code];

    if (content) {
      return { content, contentLocale: code };
    }
  }

  const firstLocale = Object.keys(contentByLocale)[0];

  if (!firstLocale) {
    throw new Error("Guide has no locale content");
  }

  return {
    content: contentByLocale[firstLocale],
    contentLocale: firstLocale,
  };
}

export function resolveBlogCoverImageAlt(
  coverImageAltByLocale: Record<string, string>,
  locale: string,
): string {
  const candidates = [locale, ...FALLBACK_LOCALES];

  for (const code of candidates) {
    const alt = coverImageAltByLocale[code]?.trim();

    if (alt) {
      return alt;
    }
  }

  return Object.values(coverImageAltByLocale).find((value) => value.trim()) ?? "";
}
