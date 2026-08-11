import "server-only";

import { parseBookingSearchParams } from "@/features/booking/lib/parse-search-params";
import { buildAcceptedPaymentCurrencies } from "@/features/currencies/lib/build-accepted-payment-currencies";
import {
  getCachedAirports,
  getCachedCities,
  getCachedDistricts,
  getCachedEnabledLocales,
  getCachedEnabledPaymentCurrencies,
} from "@/server/cache/public-catalog";

export async function getBookingPageData(
  locale: string,
  query: Record<string, string | string[] | undefined>,
) {
  const [
    enabledLocales,
    enabledPaymentCurrencies,
    airports,
    cities,
    districts,
  ] = await Promise.all([
    getCachedEnabledLocales(),
    getCachedEnabledPaymentCurrencies(),
    getCachedAirports(locale),
    getCachedCities(locale),
    getCachedDistricts(locale),
  ]);

  const acceptedPaymentCurrencies = buildAcceptedPaymentCurrencies(
    enabledPaymentCurrencies,
  );
  const initialSearch = parseBookingSearchParams(query);

  const cityId =
    initialSearch.cityId ||
    airports.find((airport) => airport.id === initialSearch.originAirportId)
      ?.cityId ||
    (cities.length === 1 ? cities[0]?.id : "") ||
    "";

  return {
    enabledLocales,
    airports,
    cities,
    districts,
    acceptedPaymentCurrencies,
    initialSearch: { ...initialSearch, cityId },
  };
}
