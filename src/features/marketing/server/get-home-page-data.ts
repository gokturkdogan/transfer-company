import "server-only";

import {
  getCachedAirports,
  getCachedCities,
  getCachedDistricts,
  getCachedEnabledLocales,
  getCachedFleet,
  getCachedPopularDestinations,
} from "@/server/cache/public-catalog";

export async function getHomePageData(locale: string) {
  const [airports, cities, districts, destinations, fleet, enabledLocales] =
    await Promise.all([
      getCachedAirports(locale),
      getCachedCities(locale),
      getCachedDistricts(locale),
      getCachedPopularDestinations(locale),
      getCachedFleet(locale),
      getCachedEnabledLocales(),
    ]);

  return {
    airports,
    cities,
    districts,
    destinations,
    fleet,
    enabledLocales,
  };
}
