import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { AboutCta } from "@/components/about/AboutCta";
import { AboutHero } from "@/components/about/AboutHero";
import { AboutPromise } from "@/components/about/AboutPromise";
import { AboutStory } from "@/components/about/AboutStory";
import { AboutValues } from "@/components/about/AboutValues";
import { MobileContactBar } from "@/components/shared/MobileContactBar";
import { SiteFooter } from "@/components/shared/SiteFooter";
import { SiteHeader } from "@/components/shared/SiteHeader";
import { LOCALES } from "@/config/constants";
import { ABOUT_IMAGES } from "@/config/about-images";
import { clientEnv } from "@/config/env";
import { db } from "@/db/client";
import { LocaleRepository } from "@/features/locales/server/repository";
import { resolveSiteLocales } from "@/features/locales/server/resolve-site-locales";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about.meta" });

  const baseUrl = clientEnv.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  const title = t("title");
  const description = t("description");

  return {
    title,
    description,
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: `/${locale}/about`,
      languages: Object.fromEntries(
        LOCALES.map((alternate) => [alternate, `/${alternate}/about`]),
      ),
    },
    openGraph: {
      type: "website",
      locale,
      url: `${baseUrl}/${locale}/about`,
      title,
      description,
      images: [
        {
          url: ABOUT_IMAGES.hero,
          width: 1920,
          height: 1080,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ABOUT_IMAGES.hero],
    },
    robots: { index: true, follow: true },
  };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const enabledLocales = await resolveSiteLocales(new LocaleRepository(db));

  return (
    <>
      <SiteHeader enabledLocales={enabledLocales} />
      <main className="flex flex-1 flex-col pb-20 md:pb-0">
        <AboutHero />
        <AboutStory />
        <AboutValues />
        <AboutPromise />
        <AboutCta />
      </main>
      <SiteFooter enabledLocales={enabledLocales} />
      <MobileContactBar />
    </>
  );
}
