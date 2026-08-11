import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Container } from "@/components/layout/Container";
import { MobileContactBar } from "@/components/shared/MobileContactBar";
import { SiteFooter } from "@/components/shared/SiteFooter";
import { SiteHeader } from "@/components/shared/SiteHeader";
import { resolveDestinationImage } from "@/features/marketing/lib/resolve-destination-image";
import { Link } from "@/i18n/navigation";
import { buildPageMetadata } from "@/lib/seo/metadata";
import {
  getCachedAirports,
  getCachedDistricts,
  getCachedEnabledLocales,
  getCachedPopularDestinations,
} from "@/server/cache/public-catalog";

export const revalidate = 120;

type PageParams = {
  params: Promise<{ locale: string; districtSlug: string }>;
};

function normalizeDistrictSlug(slug: string): string {
  return slug.trim().toLowerCase();
}

export async function generateStaticParams() {
  const destinations = await getCachedPopularDestinations("tr");

  return destinations.map((destination) => ({
    districtSlug: destination.code.toLowerCase(),
  }));
}

export async function generateMetadata({
  params,
}: PageParams): Promise<Metadata> {
  const { locale, districtSlug } = await params;
  const slug = normalizeDistrictSlug(districtSlug);

  const [districts, destinations, enabledLocales, t] = await Promise.all([
    getCachedDistricts(locale),
    getCachedPopularDestinations(locale),
    getCachedEnabledLocales(),
    getTranslations({ locale, namespace: "transfers.district" }),
  ]);

  const district =
    districts.find((item) => item.code.toLowerCase() === slug) ?? null;

  if (!district) {
    return {};
  }

  const featured = destinations.find((item) => item.id === district.id);
  const imageSrc = resolveDestinationImage(featured?.imageKey, district.code);

  return buildPageMetadata({
    locale,
    path: `/transfers/${slug}`,
    title: t("title", { destination: district.name }),
    description: t("description", { destination: district.name }),
    enabledLocales: enabledLocales.map((item) => item.code),
    image: {
      url: imageSrc,
      width: 1200,
      height: 800,
      alt: district.name,
    },
  });
}

export default async function TransferDistrictPage({ params }: PageParams) {
  const { locale, districtSlug } = await params;
  setRequestLocale(locale);

  const slug = normalizeDistrictSlug(districtSlug);

  const [districts, destinations, airports, enabledLocales, t] =
    await Promise.all([
      getCachedDistricts(locale),
      getCachedPopularDestinations(locale),
      getCachedAirports(locale),
      getCachedEnabledLocales(),
      getTranslations({ locale, namespace: "transfers.district" }),
    ]);

  const district = districts.find((item) => item.code.toLowerCase() === slug);

  if (!district) {
    notFound();
  }

  const featured = destinations.find((item) => item.id === district.id);
  const imageSrc = resolveDestinationImage(featured?.imageKey, district.code);
  const defaultAirport =
    airports.find((airport) => airport.code === "AYT") ?? airports[0];

  const bookingHref = defaultAirport
    ? `/booking?airport=${defaultAirport.id}&district=${district.id}`
    : "/booking";

  return (
    <>
      <SiteHeader enabledLocales={enabledLocales} />
      <main className="flex flex-1 flex-col pb-20 md:pb-0">
        <section className="relative isolate overflow-hidden bg-ink text-white">
          <Image
            src={imageSrc}
            alt={district.name}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-ink/25" />
          <Container className="relative z-[1] flex min-h-[70vh] flex-col justify-end py-16 md:py-24">
            <div className="max-w-2xl space-y-5">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                {t("heading", { destination: district.name })}
              </h1>
              <p className="text-base leading-relaxed text-white/85 sm:text-lg">
                {t("body", { destination: district.name })}
              </p>
              <Link
                href={bookingHref}
                className="inline-flex h-12 items-center justify-center rounded-full bg-gold-gradient px-7 text-sm font-bold text-ink shadow-gold transition-all duration-300 hover:brightness-110"
              >
                {t("cta")}
              </Link>
            </div>
          </Container>
        </section>
      </main>
      <SiteFooter enabledLocales={enabledLocales} />
      <MobileContactBar />
    </>
  );
}
