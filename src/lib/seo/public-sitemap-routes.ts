import type { MetadataRoute } from "next";

import { DEFAULT_LOCALE } from "@/config/constants";
import { listPublishedLocalesForPost } from "@/features/blog/domain/blog-published-locales";
import { buildLanguageAlternates } from "@/lib/seo/metadata";
import {
  getCachedBlogPostBySlug,
  getCachedBlogSlugs,
} from "@/server/cache/blog-posts";
import {
  getCachedActiveVehicleCodes,
  getCachedEnabledLocales,
} from "@/server/cache/public-catalog";

const STATIC_ROUTES = [
  { path: "", changeFrequency: "daily" as const, priority: 1 },
  { path: "/about", changeFrequency: "monthly" as const, priority: 0.7 },
  { path: "/booking", changeFrequency: "weekly" as const, priority: 0.9 },
  { path: "/fleet", changeFrequency: "weekly" as const, priority: 0.8 },
  { path: "/blog", changeFrequency: "weekly" as const, priority: 0.75 },
  { path: "/privacy", changeFrequency: "yearly" as const, priority: 0.3 },
];

type RouteDefinition = {
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
};

function buildLocaleRouteEntries(
  baseUrl: string,
  routes: RouteDefinition[],
  localeCodes: readonly string[],
  lastModified: Date,
  alternateLocales?: readonly string[],
): MetadataRoute.Sitemap {
  const hreflangLocales = alternateLocales ?? localeCodes;

  return localeCodes.flatMap((locale) =>
    routes.map((route) => ({
      url: `${baseUrl}/${locale}${route.path}`,
      lastModified,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
      alternates: {
        languages: buildLanguageAlternates(route.path, hreflangLocales, baseUrl),
      },
    })),
  );
}

export async function getPublicSitemapEntries(
  baseUrl: string,
): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();
  const normalizedBaseUrl = baseUrl.replace(/\/$/, "");

  const [enabledLocales, vehicleCodes, blogSlugs] = await Promise.all([
    getCachedEnabledLocales(),
    getCachedActiveVehicleCodes(),
    getCachedBlogSlugs(),
  ]);

  const localeCodes =
    enabledLocales.length > 0
      ? enabledLocales.map((locale) => locale.code)
      : [DEFAULT_LOCALE];

  const fleetRoutes = vehicleCodes.map((code) => ({
    path: `/fleet/${code.toLowerCase()}`,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const staticEntries = buildLocaleRouteEntries(
    normalizedBaseUrl,
    STATIC_ROUTES,
    localeCodes,
    lastModified,
  );

  const fleetEntries = buildLocaleRouteEntries(
    normalizedBaseUrl,
    fleetRoutes,
    localeCodes,
    lastModified,
  );

  const blogPosts = await Promise.all(
    blogSlugs.map(async (slug) => {
      const post = await getCachedBlogPostBySlug(slug);

      if (!post) {
        return null;
      }

      return {
        slug,
        locales: listPublishedLocalesForPost(post, localeCodes),
      };
    }),
  );

  const blogEntries: MetadataRoute.Sitemap = [];

  for (const entry of blogPosts) {
    if (!entry || entry.locales.length === 0) {
      continue;
    }

    const path = `/blog/${entry.slug}`;

    for (const locale of entry.locales) {
      blogEntries.push({
        url: `${normalizedBaseUrl}/${locale}${path}`,
        lastModified,
        changeFrequency: "weekly",
        priority: 0.7,
        alternates: {
          languages: buildLanguageAlternates(path, entry.locales, normalizedBaseUrl),
        },
      });
    }
  }

  return [...staticEntries, ...fleetEntries, ...blogEntries];
}
