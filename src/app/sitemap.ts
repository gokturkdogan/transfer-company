import type { MetadataRoute } from "next";

import { LOCALES } from "@/config/constants";
import { clientEnv } from "@/config/env";

const ROUTES = [
  { path: "", changeFrequency: "daily" as const, priority: 1 },
  { path: "/booking", changeFrequency: "weekly" as const, priority: 0.8 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = clientEnv.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  const lastModified = new Date();

  return LOCALES.flatMap((locale) =>
    ROUTES.map((route) => ({
      url: `${baseUrl}/${locale}${route.path}`,
      lastModified,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
      alternates: {
        languages: Object.fromEntries(
          LOCALES.map((alternate) => [
            alternate,
            `${baseUrl}/${alternate}${route.path}`,
          ]),
        ),
      },
    })),
  );
}
