import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { FaqSection } from "@/components/homepage/FaqSection";
import { FinalCta } from "@/components/homepage/FinalCta";
import { FleetSection } from "@/components/homepage/FleetSection";
import { HeroSection } from "@/components/homepage/HeroSection";
import { HomeBookingWidget } from "@/components/homepage/HomeBookingWidget";
import { HowItWorks } from "@/components/homepage/HowItWorks";
import { PopularDestinations } from "@/components/homepage/PopularDestinations";
import { SeoContent } from "@/components/homepage/SeoContent";
import { StatsBand } from "@/components/homepage/StatsBand";
import { Testimonials } from "@/components/homepage/Testimonials";
import { TrustBar } from "@/components/homepage/TrustBar";
import { WhyChooseUs } from "@/components/homepage/WhyChooseUs";
import { HomeJsonLd } from "@/components/seo/HomeJsonLd";
import { MobileContactBar } from "@/components/shared/MobileContactBar";
import { SiteFooter } from "@/components/shared/SiteFooter";
import { SiteHeader } from "@/components/shared/SiteHeader";
import { HOMEPAGE_IMAGES } from "@/config/homepage-images";
import { getHomePageData } from "@/features/marketing/server/get-home-page-data";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { getCachedEnabledLocales } from "@/server/cache/public-catalog";

export const revalidate = 120;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const [t, enabledLocales] = await Promise.all([
    getTranslations({ locale, namespace: "home.meta" }),
    getCachedEnabledLocales(),
  ]);

  return buildPageMetadata({
    locale,
    path: "",
    title: t("title"),
    description: t("description"),
    keywords: t("keywords"),
    enabledLocales: enabledLocales.map((item) => item.code),
    image: {
      url: HOMEPAGE_IMAGES.hero,
      width: 1920,
      height: 1080,
      alt: t("title"),
    },
  });
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const {
    airports,
    cities,
    districts,
    destinations,
    fleet,
    enabledLocales,
  } = await getHomePageData(locale);

  const cityId = cities.length === 1 ? (cities[0]?.id ?? "") : "";

  return (
    <>
      <HomeJsonLd locale={locale} />
      <SiteHeader enabledLocales={enabledLocales} />
      <main className="flex flex-1 flex-col pb-20 md:pb-0">
        <HeroSection
          bookingForm={
            <HomeBookingWidget
              airports={airports}
              cities={cities}
              districts={districts}
              initialSearch={{ cityId }}
            />
          }
        />
        <TrustBar />
        <PopularDestinations destinations={destinations} />
        <StatsBand />
        <FleetSection fleet={fleet} />
        <HowItWorks />
        <WhyChooseUs />
        <SeoContent />
        <Testimonials />
        <FaqSection />
        <FinalCta />
      </main>
      <SiteFooter enabledLocales={enabledLocales} />
      <MobileContactBar />
    </>
  );
}
