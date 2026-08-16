import type { MetadataRoute } from "next";

import { clientEnv } from "@/config/env";
import { getPublicSitemapEntries } from "@/lib/seo/public-sitemap-routes";

export const revalidate = 120;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = clientEnv.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");

  return getPublicSitemapEntries(baseUrl);
}
