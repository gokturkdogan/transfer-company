import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { SiteFooter } from "@/components/shared/SiteFooter";
import { SiteHeader } from "@/components/shared/SiteHeader";
import { BookingFlowWithInit } from "@/features/booking/components/BookingFlowWithInit";
import { BookingFlowProvider } from "@/features/booking/context/booking-flow-context";
import { parseBookingSearchParams } from "@/features/booking/lib/parse-search-params";
import { db } from "@/db/client";
import { buildAcceptedPaymentCurrencies } from "@/features/currencies/lib/build-accepted-payment-currencies";
import { CurrencyRepository } from "@/features/currencies/server/repository";
import { LocationRepository } from "@/features/locations/server/repository";
import { LocationService } from "@/features/locations/server/service";
import { LocaleRepository } from "@/features/locales/server/repository";
import { resolveSiteLocales } from "@/features/locales/server/resolve-site-locales";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "booking.page" });

  return {
    title: t("title"),
    description: t("subtitle"),
  };
}

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
  const enabledPaymentCurrencies = await new CurrencyRepository(db).listEnabled();
  const acceptedPaymentCurrencies = buildAcceptedPaymentCurrencies(
    enabledPaymentCurrencies,
  );
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
          acceptedPaymentCurrencies={acceptedPaymentCurrencies}
          initialSearch={{ ...initialSearch, cityId: cityId ?? "" }}
        >
          <BookingFlowWithInit initialSearch={initialSearch} />
        </BookingFlowProvider>
      </main>
      <SiteFooter enabledLocales={enabledLocales} />
    </>
  );
}
