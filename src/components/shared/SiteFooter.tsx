import { getTranslations } from "next-intl/server";

import { Container } from "@/components/layout/Container";
import { LOCALES } from "@/config/constants";
import { siteConfig } from "@/config/site";
import { Link } from "@/i18n/navigation";

const localeLabels: Record<string, string> = {
  tr: "Türkçe",
  en: "English",
  de: "Deutsch",
  ru: "Русский",
  ar: "العربية",
};

export async function SiteFooter() {
  const t = await getTranslations("home.footer");
  const common = await getTranslations("common");

  return (
    <footer className="border-t border-white/10 bg-dark py-16 text-white">
      <Container>
        <div className="grid gap-10 md:grid-cols-3">
          <div className="space-y-4">
            <p className="text-xl font-semibold">{common("appName")}</p>
            <p className="text-sm leading-relaxed text-white/60">
              {t("description")}
            </p>
          </div>

          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-wider text-accent">
              {t("linksTitle")}
            </p>
            <ul className="space-y-2 text-sm text-white/70">
              <li>
                <a href="#booking" className="hover:text-white">
                  {t("bookTransfer")}
                </a>
              </li>
              <li>
                <Link href="/booking" className="hover:text-white">
                  {t("fullBooking")}
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-wider text-accent">
              {t("contactTitle")}
            </p>
            <ul className="space-y-2 text-sm text-white/70">
              <li>
                <a href={`tel:${siteConfig.phone.replace(/\s/g, "")}`}>
                  {siteConfig.phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
              </li>
              <li>{siteConfig.supportHours}</li>
            </ul>
            <div className="flex flex-wrap gap-2 pt-2">
              {LOCALES.map((locale) => (
                <Link
                  key={locale}
                  href="/"
                  locale={locale}
                  className="text-xs font-medium uppercase tracking-wide text-white/50 hover:text-accent"
                >
                  {localeLabels[locale]}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-8 text-center text-sm text-white/40">
          {t("copyright", { year: new Date().getFullYear() })}
        </div>
      </Container>
    </footer>
  );
}
