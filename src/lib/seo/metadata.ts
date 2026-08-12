import type { Metadata } from "next";

import { APP_NAME, DEFAULT_LOCALE } from "@/config/constants";
import { clientEnv } from "@/config/env";

function normalizePath(path: string): string {
  if (path === "/" || path === "") {
    return "";
  }

  return path.startsWith("/") ? path : `/${path}`;
}

/**
 * Builds hreflang language alternates for a public path.
 * Includes `x-default` pointing at the default locale (`tr`).
 */
export function buildLanguageAlternates(
  path: string,
  locales: readonly string[],
  baseUrl: string,
): Record<string, string> {
  const base = baseUrl.replace(/\/$/, "");
  const normalizedPath = normalizePath(path);

  const alternates: Record<string, string> = {};

  for (const locale of locales) {
    alternates[locale] = `${base}/${locale}${normalizedPath}`;
  }

  alternates["x-default"] = `${base}/${DEFAULT_LOCALE}${normalizedPath}`;

  return alternates;
}

/** Page title with canonical brand suffix; bypasses layout title template. */
export function buildPageTitle(pageTitle: string): string {
  if (pageTitle.includes(APP_NAME)) {
    return pageTitle;
  }

  return `${pageTitle} | ${APP_NAME}`;
}

export function buildPageMetadata(opts: {
  locale: string;
  path: string;
  title: string;
  description: string;
  enabledLocales: readonly string[];
  image?: { url: string; width?: number; height?: number; alt?: string };
  keywords?: string;
}): Metadata {
  const baseUrl = clientEnv.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  const normalizedPath = normalizePath(opts.path);
  const canonicalPath = `/${opts.locale}${normalizedPath}`;
  const pageUrl = `${baseUrl}${canonicalPath}`;
  const displayTitle = buildPageTitle(opts.title);

  return {
    title: { absolute: displayTitle },
    description: opts.description,
    ...(opts.keywords ? { keywords: opts.keywords } : {}),
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: canonicalPath,
      languages: buildLanguageAlternates(
        normalizedPath,
        opts.enabledLocales,
        baseUrl,
      ),
    },
    openGraph: {
      type: "website",
      locale: opts.locale,
      url: pageUrl,
      title: displayTitle,
      description: opts.description,
      ...(opts.image
        ? {
            images: [
              {
                url: opts.image.url,
                width: opts.image.width,
                height: opts.image.height,
                alt: opts.image.alt,
              },
            ],
          }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: displayTitle,
      description: opts.description,
      ...(opts.image ? { images: [opts.image.url] } : {}),
    },
    robots: { index: true, follow: true },
  };
}
