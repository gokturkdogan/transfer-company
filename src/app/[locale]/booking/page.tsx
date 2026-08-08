import { setRequestLocale } from "next-intl/server";

import { MobileContactBar } from "@/components/shared/MobileContactBar";
import { SiteFooter } from "@/components/shared/SiteFooter";
import { SiteHeader } from "@/components/shared/SiteHeader";
import { BookingFlowWithInit } from "@/features/booking/components/BookingFlowWithInit";
import { BookingFlowProvider } from "@/features/booking/context/booking-flow-context";
import { parseBookingSearchParams } from "@/features/booking/lib/parse-search-params";
import { db } from "@/db/client";
import { LocationRepository } from "@/features/locations/server/repository";
import { LocationService } from "@/features/locations/server/service";
import { LocaleRepository } from "@/features/locales/server/repository";
import { resolveSiteLocales } from "@/features/locales/server/resolve-site-locales";

export const dynamic = "force-dynamic";

export default async function BookingPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  const query = await searchParams;
  setRequestLocale(locale);

  const enabledLocales = await resolveSiteLocales(new LocaleRepository(db));

  const locationService = new LocationService(new LocationRepository(db));
  const airports = await locationService.getAirports(locale);
  const cities = await locationService.getCities(locale);
  const initialSearch = parseBookingSearchParams(query);

  const cityId =
    initialSearch.cityId ||
    airports.find((airport) => airport.id === initialSearch.originAirportId)
      ?.cityId ||
    (cities.length === 1 ? cities[0]?.id : "");

  const districts = (
    await Promise.all(
      cities.map((city) => locationService.getDistrictsForCity(city.id, locale)),
    )
  ).flat();

  return (
    <>
      <SiteHeader enabledLocales={enabledLocales} />
      <main>
        <BookingFlowProvider
          airports={airports}
          cities={cities}
          districts={districts}
          initialSearch={{ ...initialSearch, cityId: cityId ?? "" }}
        >
          <BookingFlowWithInit initialSearch={initialSearch} />
        </BookingFlowProvider>
      </main>
      <SiteFooter enabledLocales={enabledLocales} />
      <MobileContactBar />
    </>
  );
}
