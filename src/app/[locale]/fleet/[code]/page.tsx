import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { FleetCta } from "@/components/fleet/FleetCta";
import { VehicleDetailContent } from "@/components/fleet/VehicleDetailContent";
import { VehicleDetailHero } from "@/components/fleet/VehicleDetailHero";
import { VehicleDetailPremiumBand } from "@/components/fleet/VehicleDetailPremiumBand";
import { VehicleDetailSpecsBand } from "@/components/fleet/VehicleDetailSpecsBand";
import { MobileContactBar } from "@/components/shared/MobileContactBar";
import { SiteFooter } from "@/components/shared/SiteFooter";
import { SiteHeader } from "@/components/shared/SiteHeader";
import { db } from "@/db/client";
import { normalizeFleetVehicleCode } from "@/features/marketing/lib/fleet-vehicle-slug";
import { MarketingRepository } from "@/features/marketing/server/repository";
import { MarketingService } from "@/features/marketing/server/service";
import { resolveVehicleCoverImage } from "@/features/vehicles/lib/resolve-vehicle-cover-image";
import { VehicleFeatureRepository } from "@/features/vehicles/server/feature-repository";
import { VehicleGalleryRepository } from "@/features/vehicles/server/gallery-repository";
import { buildPageMetadata } from "@/lib/seo/metadata";
import {
  getCachedAirports,
  getCachedEnabledLocales,
} from "@/server/cache/public-catalog";

export const revalidate = 120;

function createMarketingService() {
  return new MarketingService(
    new MarketingRepository(db),
    new VehicleFeatureRepository(db),
    new VehicleGalleryRepository(db),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; code: string }>;
}): Promise<Metadata> {
  const { locale, code } = await params;
  const marketingService = createMarketingService();
  const [vehicle, enabledLocales] = await Promise.all([
    marketingService.getFleetVehicleDetail(
      normalizeFleetVehicleCode(code),
      locale,
    ),
    getCachedEnabledLocales(),
  ]);

  if (!vehicle) {
    const t = await getTranslations({ locale, namespace: "fleet.meta" });
    return { title: t("title") };
  }

  const t = await getTranslations({ locale, namespace: "fleet.vehicleDetail" });
  const title = t("metaTitle", { name: vehicle.name });
  const description =
    vehicle.shortDescription ??
    t("fallbackShortDescription", { name: vehicle.name });
  const slug = code.toLowerCase();
  const heroImage = resolveVehicleCoverImage(vehicle.imageKey, vehicle.code);

  return buildPageMetadata({
    locale,
    path: `/fleet/${slug}`,
    title,
    description,
    enabledLocales: enabledLocales.map((item) => item.code),
    image: { url: heroImage, width: 1920, height: 1080, alt: vehicle.name },
  });
}

export default async function FleetVehicleDetailPage({
  params,
}: {
  params: Promise<{ locale: string; code: string }>;
}) {
  const { locale, code } = await params;
  setRequestLocale(locale);

  const marketingService = createMarketingService();

  const [vehicle, airports, enabledLocales] = await Promise.all([
    marketingService.getFleetVehicleDetail(
      normalizeFleetVehicleCode(code),
      locale,
    ),
    getCachedAirports(locale),
    getCachedEnabledLocales(),
  ]);

  if (!vehicle) {
    notFound();
  }

  const defaultAirport =
    airports.find((airport) => airport.code === "AYT") ?? airports[0];
  const bookingHref = defaultAirport
    ? `/booking?airport=${defaultAirport.id}`
    : "/booking";

  return (
    <>
      <SiteHeader enabledLocales={enabledLocales} />
      <main className="flex flex-1 flex-col pb-20 md:pb-0">
        <VehicleDetailHero vehicle={vehicle} />
        <VehicleDetailContent vehicle={vehicle} bookingHref={bookingHref} />
        <VehicleDetailSpecsBand vehicle={vehicle} />
        <VehicleDetailPremiumBand vehicle={vehicle} />
        <FleetCta />
      </main>
      <SiteFooter enabledLocales={enabledLocales} />
      <MobileContactBar />
    </>
  );
}
