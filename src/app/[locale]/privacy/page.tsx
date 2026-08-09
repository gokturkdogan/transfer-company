import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { MobileContactBar } from "@/components/shared/MobileContactBar";
import { SiteFooter } from "@/components/shared/SiteFooter";
import { SiteHeader } from "@/components/shared/SiteHeader";
import { PrivacyContent } from "@/components/privacy/PrivacyContent";
import { PrivacyHero } from "@/components/privacy/PrivacyHero";
import { LOCALES } from "@/config/constants";
import { clientEnv } from "@/config/env";
import { db } from "@/db/client";
import { LocaleRepository } from "@/features/locales/server/repository";
import { resolveSiteLocales } from "@/features/locales/server/resolve-site-locales";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "privacy.meta" });

  const baseUrl = clientEnv.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  const title = t("title");
  const description = t("description");

  return {
    title,
    description,
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: `/${locale}/privacy`,
      languages: Object.fromEntries(
        LOCALES.map((alternate) => [alternate, `/${alternate}/privacy`]),
      ),
    },
    openGraph: {
      type: "website",
      locale,
      url: `${baseUrl}/${locale}/privacy`,
      title,
      description,
    },
    robots: { index: true, follow: true },
  };
}

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const enabledLocales = await resolveSiteLocales(new LocaleRepository(db));

  return (
    <>
      <SiteHeader enabledLocales={enabledLocales} />
      <main className="flex flex-1 flex-col pb-20 md:pb-0">
        <PrivacyHero />
        <PrivacyContent />
      </main>
      <SiteFooter enabledLocales={enabledLocales} />
      <MobileContactBar />
    </>
  );
}
