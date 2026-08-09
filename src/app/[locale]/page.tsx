import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { FaqSection } from "@/components/homepage/FaqSection";
import { FinalCta } from "@/components/homepage/FinalCta";
import { FleetSection } from "@/components/homepage/FleetSection";
import { HeroSection } from "@/components/homepage/HeroSection";
import { HomeBookingWidget } from "@/components/homepage/HomeBookingWidget";
import { HowItWorks } from "@/components/homepage/HowItWorks";
import { PopularDestinations } from "@/components/homepage/PopularDestinations";
import { SeoContent } from "@/components/homepage/SeoContent";
import { StatsBand } from "@/components/homepage/StatsBand";
import { Testimonials } from "@/components/homepage/Testimonials";
import { TrustBar } from "@/components/homepage/TrustBar";
import { WhyChooseUs } from "@/components/homepage/WhyChooseUs";
import { HomeJsonLd } from "@/components/seo/HomeJsonLd";
import { MobileContactBar } from "@/components/shared/MobileContactBar";
import { SiteFooter } from "@/components/shared/SiteFooter";
import { SiteHeader } from "@/components/shared/SiteHeader";
import { LOCALES } from "@/config/constants";
import { clientEnv } from "@/config/env";
import { HOMEPAGE_IMAGES } from "@/config/homepage-images";
import { db } from "@/db/client";
import { CurrencyRepository, resolveQuoteCurrency } from "@/features/currencies/server/repository";
import { LocationRepository } from "@/features/locations/server/repository";
import { LocationService } from "@/features/locations/server/service";
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
  const t = await getTranslations({ locale, namespace: "home.meta" });

  const baseUrl = clientEnv.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  const title = t("title");
  const description = t("description");

  return {
    title,
    description,
    keywords: t("keywords"),
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: `/${locale}`,
      languages: Object.fromEntries(
        LOCALES.map((alternate) => [alternate, `/${alternate}`]),
      ),
    },
    openGraph: {
      type: "website",
      locale,
      url: `${baseUrl}/${locale}`,
      title,
      description,
      images: [
        {
          url: HOMEPAGE_IMAGES.hero,
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
      images: [HOMEPAGE_IMAGES.hero],
    },
    robots: { index: true, follow: true },
  };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const locationService = new LocationService(new LocationRepository(db));
  const marketingService = new MarketingService(
    new MarketingRepository(db),
    new VehicleFeatureRepository(db),
    new VehicleGalleryRepository(db),
  );
  const currencyRepository = new CurrencyRepository(db);
  const displayCurrency = await resolveQuoteCurrency(currencyRepository);

  const [airports, cities, destinations, fleet, enabledLocales] =
    await Promise.all([
      locationService.getAirports(locale),
      locationService.getCities(locale),
      marketingService.getPopularDestinations(locale, displayCurrency),
      marketingService.getFleet(locale),
      resolveSiteLocales(new LocaleRepository(db)),
    ]);

  const cityId = cities.length === 1 ? (cities[0]?.id ?? "") : "";

  const districts = (
    await Promise.all(
      cities.map((city) => locationService.getDistrictsForCity(city.id, locale)),
    )
  ).flat();

  const defaultAirport =
    airports.find((airport) => airport.code === "AYT") ?? airports[0];

  return (
    <>
      <HomeJsonLd locale={locale} />
      <SiteHeader enabledLocales={enabledLocales} />
      <main className="flex flex-1 flex-col pb-20 md:pb-0">
        <HeroSection
          bookingForm={
            <HomeBookingWidget
              airports={airports}
              cities={cities}
              districts={districts}
              initialSearch={{ cityId }}
            />
          }
        />
        <TrustBar />
        {defaultAirport && (
          <PopularDestinations
            destinations={destinations}
            airportId={defaultAirport.id}
          />
        )}
        <StatsBand />
        <FleetSection fleet={fleet} />
        <HowItWorks />
        <WhyChooseUs />
        <SeoContent />
        <Testimonials />
        <FaqSection />
        <FinalCta />
      </main>
      <SiteFooter enabledLocales={enabledLocales} />
      <MobileContactBar />
    </>
  );
}
