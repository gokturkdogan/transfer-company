import { beforeEach, describe, expect, it, vi } from "vitest";

import type { BlogPostDefinition } from "@/content/blog/types";
import { getPublicSitemapEntries } from "@/lib/seo/public-sitemap-routes";

const getCachedEnabledLocales = vi.fn();
const getCachedActiveVehicleCodes = vi.fn();
const getCachedBlogSlugs = vi.fn();
const getCachedBlogPostBySlug = vi.fn();

vi.mock("@/server/cache/public-catalog", () => ({
  getCachedEnabledLocales: () => getCachedEnabledLocales(),
  getCachedActiveVehicleCodes: () => getCachedActiveVehicleCodes(),
}));

vi.mock("@/server/cache/blog-posts", () => ({
  getCachedBlogSlugs: () => getCachedBlogSlugs(),
  getCachedBlogPostBySlug: (slug: string) => getCachedBlogPostBySlug(slug),
}));

const baseUrl = "https://example.com";

const blogPost: BlogPostDefinition = {
  slug: "kemer-guide",
  publishedAt: "2026-01-15",
  coverImage: "https://example.com/cover.jpg",
  coverImageAlt: { tr: "Kemer" },
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

beforeEach(() => {
  vi.clearAllMocks();

  getCachedEnabledLocales.mockResolvedValue([
    { code: "tr", name: "Türkçe" },
    { code: "en", name: "English" },
  ]);
  getCachedActiveVehicleCodes.mockResolvedValue(["VITO"]);
  getCachedBlogSlugs.mockResolvedValue(["kemer-guide"]);
  getCachedBlogPostBySlug.mockResolvedValue(blogPost);
});

describe("getPublicSitemapEntries", () => {
  it("includes static, fleet, and blog routes for enabled locales", async () => {
    const entries = await getPublicSitemapEntries(baseUrl);

    expect(entries.some((entry) => entry.url === `${baseUrl}/tr`)).toBe(true);
    expect(entries.some((entry) => entry.url === `${baseUrl}/en/booking`)).toBe(
      true,
    );
    expect(
      entries.some((entry) => entry.url === `${baseUrl}/tr/fleet/vito`),
    ).toBe(true);
    expect(
      entries.some((entry) => entry.url === `${baseUrl}/tr/blog/kemer-guide`),
    ).toBe(true);
    expect(
      entries.some((entry) => entry.url === `${baseUrl}/en/blog/kemer-guide`),
    ).toBe(true);
  });

  it("does not include transfer landing URLs", async () => {
    const entries = await getPublicSitemapEntries(baseUrl);

    expect(entries.some((entry) => entry.url.includes("/transfers/"))).toBe(
      false,
    );
  });

  it("limits blog article hreflang alternates to published locales", async () => {
    const entries = await getPublicSitemapEntries(baseUrl);
    const trArticle = entries.find(
      (entry) => entry.url === `${baseUrl}/tr/blog/kemer-guide`,
    );

    expect(trArticle?.alternates?.languages).toEqual({
      tr: `${baseUrl}/tr/blog/kemer-guide`,
      en: `${baseUrl}/en/blog/kemer-guide`,
      "x-default": `${baseUrl}/tr/blog/kemer-guide`,
    });
  });

  it("generates one locale row per enabled locale for static routes", async () => {
    const entries = await getPublicSitemapEntries(baseUrl);
    const aboutEntries = entries.filter((entry) =>
      entry.url.endsWith("/about"),
    );

    expect(aboutEntries).toHaveLength(2);
  });
});
