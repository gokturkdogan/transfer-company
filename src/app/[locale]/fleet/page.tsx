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
import { LOCALES } from "@/config/constants";
import { clientEnv } from "@/config/env";
import { FLEET_PAGE_IMAGES } from "@/config/fleet-images";
import { db } from "@/db/client";
import { MarketingRepository } from "@/features/marketing/server/repository";
import { MarketingService } from "@/features/marketing/server/service";
import { LocaleRepository } from "@/features/locales/server/repository";
import { resolveSiteLocales } from "@/features/locales/server/resolve-site-locales";
import { VehicleFeatureRepository } from "@/features/vehicles/server/feature-repository";
import { VehicleGalleryRepository } from "@/features/vehicles/server/gallery-repository";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "fleet.meta" });

  const baseUrl = clientEnv.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  const title = t("title");
  const description = t("description");

  return {
    title,
    description,
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: `/${locale}/fleet`,
      languages: Object.fromEntries(
        LOCALES.map((alternate) => [alternate, `/${alternate}/fleet`]),
      ),
    },
    openGraph: {
      type: "website",
      locale,
      url: `${baseUrl}/${locale}/fleet`,
      title,
      description,
      images: [
        {
          url: FLEET_PAGE_IMAGES.hero,
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
      images: [FLEET_PAGE_IMAGES.hero],
    },
    robots: { index: true, follow: true },
  };
}

export default async function FleetPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const marketingService = new MarketingService(
    new MarketingRepository(db),
    new VehicleFeatureRepository(db),
    new VehicleGalleryRepository(db),
  );

  const [fleet, enabledLocales] = await Promise.all([
    marketingService.getFleet(locale),
    resolveSiteLocales(new LocaleRepository(db)),
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
