import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";

import { DEFAULT_LOCALE, isRtlLocale } from "@/config/constants";
import { getCachedEnabledLocales } from "@/server/cache/public-catalog";
import { BRAND_IMAGES } from "@/config/brand";
import { PublicGlobalLoaderProvider } from "@/components/shared/public-global-loader-provider";
import { PublicContactProvider } from "@/features/contact/components/PublicContactProvider";
import { getPublicContactChannels } from "@/features/contact/server/public-contact";
import { routing } from "@/i18n/routing";

import "../globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "common" });

  return {
    title: {
      default: t("appName"),
      template: `%s | ${t("appName")}`,
    },
    description: t("tagline"),
    icons: {
      icon: [
        { url: BRAND_IMAGES.icon192, type: "image/png", sizes: "192x192" },
        { url: BRAND_IMAGES.icon512, type: "image/png", sizes: "512x512" },
      ],
    },
    openGraph: {
      type: "website",
      locale,
      siteName: t("appName"),
      title: t("appName"),
      description: t("tagline"),
    },
    twitter: {
      card: "summary_large_image",
      title: t("appName"),
      description: t("tagline"),
    },
  };
}

export async function generateStaticParams() {
  const enabledLocales = await getCachedEnabledLocales();

  if (enabledLocales.length === 0) {
    return [{ locale: DEFAULT_LOCALE }];
  }

  return enabledLocales.map((locale) => ({ locale: locale.code }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const [messages, contactChannels] = await Promise.all([
    getMessages(),
    getPublicContactChannels(),
  ]);

  return (
    <html
      lang={locale}
      dir={isRtlLocale(locale) ? "rtl" : "ltr"}
      className={`${manrope.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        <NextIntlClientProvider messages={messages}>
          <PublicGlobalLoaderProvider>
            <PublicContactProvider channels={contactChannels}>
              {children}
            </PublicContactProvider>
          </PublicGlobalLoaderProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
