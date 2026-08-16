import { describe, expect, it } from "vitest";

import type { BlogPostDefinition } from "@/content/blog/types";
import { listPublishedLocalesForPost } from "@/features/blog/domain/blog-published-locales";

const post: BlogPostDefinition = {
  slug: "antalya-guide",
  publishedAt: "2026-01-15",
  coverImage: "https://example.com/cover.jpg",
  coverImageAlt: { tr: "Antalya" },
  content: {
    tr: {
      title: "TR",
      metaDescription: "TR",
      excerpt: "TR",
      readingMinutes: 4,
      intro: "TR",
      sections: [],
    },
    en: {
      title: "EN",
      metaDescription: "EN",
      excerpt: "EN",
      readingMinutes: 4,
      intro: "EN",
      sections: [],
    },
  },
};

describe("listPublishedLocalesForPost", () => {
  it("returns only enabled locales that have stored translations", () => {
    expect(listPublishedLocalesForPost(post, ["tr", "en", "de", "ru"])).toEqual([
      "tr",
      "en",
    ]);
  });

  it("ignores content locales that are not enabled on the site", () => {
    expect(listPublishedLocalesForPost(post, ["en"])).toEqual(["en"]);
  });
});
