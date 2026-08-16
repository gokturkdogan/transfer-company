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
import { PUBLIC_CATALOG_CACHE_TAG } from "@/server/cache/revalidate-tags";

const REVALIDATE_SECONDS = 120;

const catalogCacheOptions = {
  revalidate: REVALIDATE_SECONDS,
  tags: [PUBLIC_CATALOG_CACHE_TAG],
};

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
    catalogCacheOptions,
  )();
}

export function getCachedCities(locale: string) {
  return unstable_cache(
    async () => createLocationService().getCities(locale),
    ["public-catalog", "cities", locale],
    catalogCacheOptions,
  )();
}

export function getCachedDistricts(locale: string) {
  return unstable_cache(
    async () => createLocationService().getAllDistricts(locale),
    ["public-catalog", "districts", locale],
    catalogCacheOptions,
  )();
}

export function getCachedPopularDestinations(locale: string) {
  return unstable_cache(
    async () => createMarketingService().getPopularDestinations(locale),
    ["public-catalog", "popular-destinations", locale],
    catalogCacheOptions,
  )();
}

export function getCachedFleet(locale: string) {
  return unstable_cache(
    async () => createMarketingService().getFleet(locale),
    ["public-catalog", "fleet", locale],
    catalogCacheOptions,
  )();
}

export function getCachedFleetVehicleDetail(code: string, locale: string) {
  return unstable_cache(
    async () => createMarketingService().getFleetVehicleDetail(code, locale),
    ["public-catalog", "fleet-detail", code, locale],
    catalogCacheOptions,
  )();
}

export function getCachedEnabledLocales() {
  return unstable_cache(
    async () => resolveSiteLocales(new LocaleRepository(db)),
    ["public-catalog", "enabled-locales"],
    catalogCacheOptions,
  )();
}

export function getCachedEnabledPaymentCurrencies() {
  return unstable_cache(
    async () => new CurrencyRepository(db).listEnabled(),
    ["public-catalog", "enabled-payment-currencies"],
    catalogCacheOptions,
  )();
}

export function getCachedActiveVehicleCodes() {
  return unstable_cache(
    async () => createMarketingService().getActiveFleetCodes(),
    ["public-catalog", "active-vehicle-codes"],
    catalogCacheOptions,
  )();
}

export { getCachedSocialMediaLinks } from "@/server/cache/social-media";
