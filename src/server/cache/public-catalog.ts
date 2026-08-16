import "server-only";

import { unstable_cache } from "next/cache";

import { db } from "@/db/client";
import { CurrencyRepository } from "@/features/currencies/server/repository";
import { LocationRepository } from "@/features/locations/server/repository";
import { LocationService } from "@/features/locations/server/service";
import { LocaleRepository } from "@/features/locales/server/repository";
import { resolveSiteLocales } from "@/features/locales/server/resolve-site-locales";
import { MarketingRepository } from "@/features/marketing/server/repository";
import { MarketingService } from "@/features/marketing/server/service";
import { VehicleFeatureRepository } from "@/features/vehicles/server/feature-repository";
import { VehicleGalleryRepository } from "@/features/vehicles/server/gallery-repository";

const REVALIDATE_SECONDS = 120;

function createLocationService(): LocationService {
  return new LocationService(new LocationRepository(db));
}

function createMarketingService(): MarketingService {
  return new MarketingService(
    new MarketingRepository(db),
    new VehicleFeatureRepository(db),
    new VehicleGalleryRepository(db),
  );
}

export function getCachedAirports(locale: string) {
  return unstable_cache(
    async () => createLocationService().getAirports(locale),
    ["public-catalog", "airports", locale],
    { revalidate: REVALIDATE_SECONDS },
  )();
}

export function getCachedCities(locale: string) {
  return unstable_cache(
    async () => createLocationService().getCities(locale),
    ["public-catalog", "cities", locale],
    { revalidate: REVALIDATE_SECONDS },
  )();
}

export function getCachedDistricts(locale: string) {
  return unstable_cache(
    async () => createLocationService().getAllDistricts(locale),
    ["public-catalog", "districts", locale],
    { revalidate: REVALIDATE_SECONDS },
  )();
}

export function getCachedPopularDestinations(locale: string) {
  return unstable_cache(
    async () => createMarketingService().getPopularDestinations(locale),
    ["public-catalog", "popular-destinations", locale],
    { revalidate: REVALIDATE_SECONDS },
  )();
}

export function getCachedFleet(locale: string) {
  return unstable_cache(
    async () => createMarketingService().getFleet(locale),
    ["public-catalog", "fleet", locale],
    { revalidate: REVALIDATE_SECONDS },
  )();
}

export function getCachedEnabledLocales() {
  return unstable_cache(
    async () => resolveSiteLocales(new LocaleRepository(db)),
    ["public-catalog", "enabled-locales"],
    { revalidate: REVALIDATE_SECONDS },
  )();
}

export function getCachedEnabledPaymentCurrencies() {
  return unstable_cache(
    async () => new CurrencyRepository(db).listEnabled(),
    ["public-catalog", "enabled-payment-currencies"],
    { revalidate: REVALIDATE_SECONDS },
  )();
}

export function getCachedActiveVehicleCodes() {
  return unstable_cache(
    async () => createMarketingService().getActiveFleetCodes(),
    ["public-catalog", "active-vehicle-codes"],
    { revalidate: REVALIDATE_SECONDS },
  )();
}

export { getCachedSocialMediaLinks } from "@/server/cache/social-media";
