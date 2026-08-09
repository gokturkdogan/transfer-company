import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";

import { isRtlLocale } from "@/config/constants";
import { PublicContactProvider } from "@/features/contact/components/PublicContactProvider";
import { getPublicContactChannels } from "@/features/contact/server/public-contact";
import { routing } from "@/i18n/routing";

import "flag-icons/css/flag-icons.min.css";
import "../globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "VIP Transfer",
  description: "Premium airport transfer booking platform",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
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
          <PublicContactProvider channels={contactChannels}>
            {children}
          </PublicContactProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
