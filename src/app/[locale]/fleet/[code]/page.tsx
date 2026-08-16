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
import { DEFAULT_LOCALE } from "@/config/constants";
import { normalizeFleetVehicleCode } from "@/features/marketing/lib/fleet-vehicle-slug";
import { getFleetVehicleDetailForPage } from "@/features/marketing/server/get-fleet-vehicle-detail";
import { resolveVehicleCoverImage } from "@/features/vehicles/lib/resolve-vehicle-cover-image";
import { buildPageMetadata } from "@/lib/seo/metadata";
import {
  getCachedActiveVehicleCodes,
  getCachedAirports,
  getCachedEnabledLocales,
} from "@/server/cache/public-catalog";

export const revalidate = 120;

export async function generateStaticParams() {
  const [enabledLocales, vehicleCodes] = await Promise.all([
    getCachedEnabledLocales(),
    getCachedActiveVehicleCodes(),
  ]);

  const localeCodes =
    enabledLocales.length > 0
      ? enabledLocales.map((locale) => locale.code)
      : [DEFAULT_LOCALE];

  return localeCodes.flatMap((locale) =>
    vehicleCodes.map((code) => ({
      locale,
      code: code.toLowerCase(),
    })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; code: string }>;
}): Promise<Metadata> {
  const { locale, code } = await params;
  const normalizedCode = normalizeFleetVehicleCode(code);
  const [vehicle, enabledLocales] = await Promise.all([
    getFleetVehicleDetailForPage(normalizedCode, locale),
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

  const normalizedCode = normalizeFleetVehicleCode(code);

  const [vehicle, airports, enabledLocales] = await Promise.all([
    getFleetVehicleDetailForPage(normalizedCode, locale),
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
