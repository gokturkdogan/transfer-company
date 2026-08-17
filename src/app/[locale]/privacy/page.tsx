import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { MobileContactBar } from "@/components/shared/MobileContactBar";
import { SiteFooter } from "@/components/shared/SiteFooter";
import { SiteHeader } from "@/components/shared/SiteHeader";
import { PrivacyContent } from "@/components/privacy/PrivacyContent";
import { PrivacyHero } from "@/components/privacy/PrivacyHero";
import { getDefaultKvkkHtml } from "@/features/privacy/lib/get-default-kvkk-html";
import { sanitizePrivacyHtml } from "@/features/privacy/lib/sanitize-privacy-html";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { getCachedEnabledLocales } from "@/server/cache/public-catalog";
import { getCachedPrivacyPageContent } from "@/server/cache/privacy-page";

export const revalidate = 120;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const [t, enabledLocales] = await Promise.all([
    getTranslations({ locale, namespace: "privacy.meta" }),
    getCachedEnabledLocales(),
  ]);

  return buildPageMetadata({
    locale,
    path: "/privacy",
    title: t("title"),
    description: t("description"),
    enabledLocales: enabledLocales.map((item) => item.code),
  });
}

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [enabledLocales, dbContent] = await Promise.all([
    getCachedEnabledLocales(),
    getCachedPrivacyPageContent(locale),
  ]);

  const html = sanitizePrivacyHtml(
    dbContent?.content ?? getDefaultKvkkHtml(locale) ?? "",
  );

  return (
    <>
      <SiteHeader enabledLocales={enabledLocales} />
      <main className="flex flex-1 flex-col pb-20 md:pb-0">
        <PrivacyHero />
        <PrivacyContent html={html} locale={locale} />
      </main>
      <SiteFooter enabledLocales={enabledLocales} />
      <MobileContactBar />
    </>
  );
}
