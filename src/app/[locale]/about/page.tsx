import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { AboutCta } from "@/components/about/AboutCta";
import { AboutHero } from "@/components/about/AboutHero";
import { AboutPromise } from "@/components/about/AboutPromise";
import { AboutSocialMedia } from "@/components/about/AboutSocialMedia";
import { AboutStory } from "@/components/about/AboutStory";
import { AboutValues } from "@/components/about/AboutValues";
import { MobileContactBar } from "@/components/shared/MobileContactBar";
import { SiteFooter } from "@/components/shared/SiteFooter";
import { SiteHeader } from "@/components/shared/SiteHeader";
import { ABOUT_IMAGES } from "@/config/about-images";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { getCachedEnabledLocales } from "@/server/cache/public-catalog";

export const revalidate = 120;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const [t, enabledLocales] = await Promise.all([
    getTranslations({ locale, namespace: "about.meta" }),
    getCachedEnabledLocales(),
  ]);

  return buildPageMetadata({
    locale,
    path: "/about",
    title: t("title"),
    description: t("description"),
    enabledLocales: enabledLocales.map((item) => item.code),
    image: {
      url: ABOUT_IMAGES.hero,
      width: 1920,
      height: 1080,
      alt: t("title"),
    },
  });
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const enabledLocales = await getCachedEnabledLocales();

  return (
    <>
      <SiteHeader enabledLocales={enabledLocales} />
      <main className="flex flex-1 flex-col pb-20 md:pb-0">
        <AboutHero />
        <AboutStory />
        <AboutSocialMedia />
        <AboutValues />
        <AboutPromise />
        <AboutCta />
      </main>
      <SiteFooter enabledLocales={enabledLocales} />
      <MobileContactBar />
    </>
  );
}
