import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { SiteFooter } from "@/components/shared/SiteFooter";
import { SiteHeader } from "@/components/shared/SiteHeader";
import { AppToastProvider } from "@/components/shared/app-toast";
import { HOMEPAGE_IMAGES } from "@/config/homepage-images";
import { BookingFlowWithInit } from "@/features/booking/components/BookingFlowWithInit";
import { BookingFlowProvider } from "@/features/booking/context/booking-flow-context";
import { getBookingPageData } from "@/features/booking/server/get-booking-page-data";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { getCachedEnabledLocales } from "@/server/cache/public-catalog";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const [t, enabledLocales] = await Promise.all([
    getTranslations({ locale, namespace: "booking.page" }),
    getCachedEnabledLocales(),
  ]);

  return buildPageMetadata({
    locale,
    path: "/booking",
    title: t("title"),
    description: t("subtitle"),
    enabledLocales: enabledLocales.map((item) => item.code),
    image: {
      url: HOMEPAGE_IMAGES.hero,
      width: 1920,
      height: 1080,
      alt: t("title"),
    },
  });
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

  const {
    enabledLocales,
    airports,
    cities,
    districts,
    acceptedPaymentCurrencies,
    initialSearch,
  } = await getBookingPageData(locale, query);

  return (
    <>
      <SiteHeader enabledLocales={enabledLocales} />
      <main>
        <AppToastProvider>
          <BookingFlowProvider
            airports={airports}
            cities={cities}
            districts={districts}
            acceptedPaymentCurrencies={acceptedPaymentCurrencies}
            initialSearch={initialSearch}
          >
            <BookingFlowWithInit initialSearch={initialSearch} />
          </BookingFlowProvider>
        </AppToastProvider>
      </main>
      <SiteFooter enabledLocales={enabledLocales} />
    </>
  );
}
