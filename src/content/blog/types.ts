export type BlogLocaleContent = {
  title: string;
  metaDescription: string;
  excerpt: string;
  readingMinutes: number;
  intro: string;
  sections: Array<{
    title: string;
    paragraphs: string[];
  }>;
  pullQuote?: string;
  tips?: string[];
  faq?: Array<{ question: string; answer: string }>;
};

export type BlogPostDefinition = {
  slug: string;
  publishedAt: string;
  coverImage: string;
  coverImageAlt: Record<"tr" | "en", string>;
  /** Optional transfer landing deep-link target */
  transferDistrictCode?: string;
  content: {
    tr: BlogLocaleContent;
    en: BlogLocaleContent;
  };
};

export type BlogPostSummary = {
  slug: string;
  publishedAt: string;
  coverImage: string;
  coverImageAlt: string;
  title: string;
  excerpt: string;
  readingMinutes: number;
};
