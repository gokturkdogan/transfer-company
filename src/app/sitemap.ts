import type { MetadataRoute } from "next";

import { DEFAULT_LOCALE } from "@/config/constants";
import { clientEnv } from "@/config/env";
import { buildLanguageAlternates } from "@/lib/seo/metadata";
import {
  getCachedActiveVehicleCodes,
  getCachedEnabledLocales,
  getCachedPopularDestinations,
} from "@/server/cache/public-catalog";
import { getAllBlogSlugs } from "@/content/blog/registry";

const STATIC_ROUTES = [
  { path: "", changeFrequency: "daily" as const, priority: 1 },
  { path: "/about", changeFrequency: "monthly" as const, priority: 0.7 },
  { path: "/booking", changeFrequency: "weekly" as const, priority: 0.9 },
  { path: "/fleet", changeFrequency: "weekly" as const, priority: 0.8 },
  { path: "/blog", changeFrequency: "weekly" as const, priority: 0.75 },
  { path: "/privacy", changeFrequency: "yearly" as const, priority: 0.3 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = clientEnv.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  const lastModified = new Date();

  const [enabledLocales, vehicleCodes, popularDestinations] = await Promise.all(
    [
      getCachedEnabledLocales(),
      getCachedActiveVehicleCodes(),
      getCachedPopularDestinations(DEFAULT_LOCALE),
    ],
  );

  const localeCodes =
    enabledLocales.length > 0
      ? enabledLocales.map((locale) => locale.code)
      : [DEFAULT_LOCALE];

  const fleetRoutes = vehicleCodes.map((code) => ({
    path: `/fleet/${code}`,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const transferRoutes = popularDestinations.map((destination) => ({
    path: `/transfers/${destination.code.toLowerCase()}`,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const blogRoutes = getAllBlogSlugs().map((slug) => ({
    path: `/blog/${slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const routes = [...STATIC_ROUTES, ...fleetRoutes, ...transferRoutes, ...blogRoutes];

  return localeCodes.flatMap((locale) =>
    routes.map((route) => ({
      url: `${baseUrl}/${locale}${route.path}`,
      lastModified,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
      alternates: {
        languages: buildLanguageAlternates(route.path, localeCodes, baseUrl),
      },
    })),
  );
}
