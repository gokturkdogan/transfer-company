import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { FleetCta } from "@/components/fleet/FleetCta";
import { FleetExperience } from "@/components/fleet/FleetExperience";
import { FleetHero } from "@/components/fleet/FleetHero";
import { FleetHighlights } from "@/components/fleet/FleetHighlights";
import { FleetShowcase } from "@/components/fleet/FleetShowcase";
import { MobileContactBar } from "@/components/shared/MobileContactBar";
import { SiteFooter } from "@/components/shared/SiteFooter";
import { SiteHeader } from "@/components/shared/SiteHeader";
import { FLEET_PAGE_IMAGES } from "@/config/fleet-images";
import { buildPageMetadata } from "@/lib/seo/metadata";
import {
  getCachedEnabledLocales,
  getCachedFleet,
} from "@/server/cache/public-catalog";

export const revalidate = 120;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const [t, enabledLocales] = await Promise.all([
    getTranslations({ locale, namespace: "fleet.meta" }),
    getCachedEnabledLocales(),
  ]);

  return buildPageMetadata({
    locale,
    path: "/fleet",
    title: t("title"),
    description: t("description"),
    enabledLocales: enabledLocales.map((item) => item.code),
    image: {
      url: FLEET_PAGE_IMAGES.hero,
      width: 1920,
      height: 1080,
      alt: t("title"),
    },
  });
}

export default async function FleetPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [fleet, enabledLocales] = await Promise.all([
    getCachedFleet(locale),
    getCachedEnabledLocales(),
  ]);

  return (
    <>
      <SiteHeader enabledLocales={enabledLocales} />
      <main className="flex flex-1 flex-col pb-20 md:pb-0">
        <FleetHero />
        <FleetHighlights />
        {fleet.length > 0 && <FleetShowcase fleet={fleet} />}
        <FleetExperience />
        <FleetCta />
      </main>
      <SiteFooter enabledLocales={enabledLocales} />
      <MobileContactBar />
    </>
  );
}
