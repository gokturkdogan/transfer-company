import { setRequestLocale } from "next-intl/server";

import { FaqSection } from "@/components/homepage/FaqSection";
import { FinalCta } from "@/components/homepage/FinalCta";
import { FleetSection } from "@/components/homepage/FleetSection";
import { HeroSection } from "@/components/homepage/HeroSection";
import { HomeBookingWidget } from "@/components/homepage/HomeBookingWidget";
import { HowItWorks } from "@/components/homepage/HowItWorks";
import { PopularDestinations } from "@/components/homepage/PopularDestinations";
import { Testimonials } from "@/components/homepage/Testimonials";
import { TrustBar } from "@/components/homepage/TrustBar";
import { WhyChooseUs } from "@/components/homepage/WhyChooseUs";
import { MobileContactBar } from "@/components/shared/MobileContactBar";
import { SiteFooter } from "@/components/shared/SiteFooter";
import { SiteHeader } from "@/components/shared/SiteHeader";
import { db } from "@/db/client";
import { LocationRepository } from "@/features/locations/server/repository";
import { LocationService } from "@/features/locations/server/service";
import { MarketingRepository } from "@/features/marketing/server/repository";
import { MarketingService } from "@/features/marketing/server/service";
import { LocaleRepository } from "@/features/locales/server/repository";
import { resolveSiteLocales } from "@/features/locales/server/resolve-site-locales";

export const dynamic = "force-dynamic";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const locationService = new LocationService(new LocationRepository(db));
  const marketingService = new MarketingService(new MarketingRepository(db));

  const [airports, cities, destinations, fleet, enabledLocales] =
    await Promise.all([
    locationService.getAirports(locale),
    locationService.getCities(locale),
    marketingService.getPopularDestinations(locale),
    marketingService.getFleet(locale),
    resolveSiteLocales(new LocaleRepository(db)),
  ]);

  const cityId =
    cities.length === 1 ? (cities[0]?.id ?? "") : "";

  const districts = (
    await Promise.all(
      cities.map((city) => locationService.getDistrictsForCity(city.id, locale)),
    )
  ).flat();

  const defaultAirport =
    airports.find((airport) => airport.code === "AYT") ?? airports[0];

  return (
    <>
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
        {defaultAirport && (
          <FleetSection
            fleet={fleet}
            airportId={defaultAirport.id}
          />
        )}
        <HowItWorks />
        <WhyChooseUs />
        <Testimonials />
        <FaqSection />
        <FinalCta />
      </main>
      <SiteFooter enabledLocales={enabledLocales} />
      <MobileContactBar />
    </>
  );
}
