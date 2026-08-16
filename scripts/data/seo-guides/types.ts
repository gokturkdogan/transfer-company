import type { BlogLocaleContent } from "../../../src/content/blog/types";

export type SeoGuideTranslation = BlogLocaleContent & {
  coverImageAlt: string;
};

export type SeoGuideSeed = {
  slug: string;
  publishedAt: string;
  coverImageUrl: string;
  transferDistrictCode?: string;
  sortOrder: number;
  translations: Record<string, SeoGuideTranslation>;
};
