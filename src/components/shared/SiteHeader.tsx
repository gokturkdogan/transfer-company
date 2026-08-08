"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ArrowRight, Menu, MessageCircle, Phone, X } from "lucide-react";

import { Container } from "@/components/layout/Container";
import { getLocaleEmoji } from "@/config/locales";
import { siteConfig } from "@/config/site";
import type { SiteLocaleOption } from "@/features/locales/types";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type SiteHeaderProps = {
  enabledLocales: SiteLocaleOption[];
};

const NAV_SECTIONS = [
  { key: "destinations", href: "#destinations" },
  { key: "fleet", href: "#fleet" },
  { key: "howItWorks", href: "#how-it-works" },
  { key: "faq", href: "#faq" },
] as const;

export function SiteHeader({ enabledLocales }: SiteHeaderProps) {
  const t = useTranslations("home.nav");
  const common = useTranslations("common");
  const currentLocale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled
          ? "border-b border-white/10 bg-ink/85 shadow-premium backdrop-blur-xl"
          : "bg-transparent",
      )}
    >
      {/* Gold hairline that reveals itself once the header condenses */}
      <span
        aria-hidden
        className={cn(
          "absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold/70 to-transparent transition-opacity duration-500",
          scrolled ? "opacity-100" : "opacity-0",
        )}
      />

      <Container>
        <div
          className={cn(
            "flex items-center justify-between transition-all duration-500",
            scrolled ? "h-16" : "h-20 md:h-24",
          )}
        >
          <Link href="/" className="group flex items-center gap-2.5">
            <span
              aria-hidden
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold-gradient text-sm font-bold text-ink shadow-gold transition-transform duration-300 group-hover:scale-105"
            >
              VT
            </span>
            <span className="text-base font-bold tracking-tight text-white sm:text-lg">
              {common("appName")}
            </span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {NAV_SECTIONS.map((section) => (
              <a
                key={section.key}
                href={section.href}
                className="rounded-full px-3.5 py-2 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
              >
                {t(section.key)}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <div className="flex items-center gap-0.5 rounded-full border border-white/15 bg-white/8 p-1 backdrop-blur-md">
              {enabledLocales.map((localeOption) => (
                <button
                  key={localeOption.code}
                  type="button"
                  title={localeOption.label}
                  onClick={() =>
                    router.replace(pathname, { locale: localeOption.code })
                  }
                  className={cn(
                    "flex cursor-pointer items-center gap-1 rounded-full px-2 py-1 text-[11px] font-bold uppercase tracking-wide transition-all duration-300",
                    currentLocale === localeOption.code
                      ? "bg-gold-gradient text-ink"
                      : "text-white/65 hover:bg-white/10 hover:text-white",
                  )}
                >
                  <span aria-hidden>{getLocaleEmoji(localeOption.code)}</span>
                  {localeOption.shortLabel}
                </button>
              ))}
            </div>

            <a
              href={`tel:${siteConfig.phone.replace(/\s/g, "")}`}
              aria-label={siteConfig.phone}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/8 text-white/80 backdrop-blur-md transition-colors hover:border-gold/50 hover:text-gold-light"
            >
              <Phone className="h-4 w-4" aria-hidden />
            </a>

            <a
              href={`https://wa.me/${siteConfig.whatsapp.replace(/\D/g, "")}`}
              target="_blank"
              rel="noreferrer"
              aria-label="WhatsApp"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/8 text-white/80 backdrop-blur-md transition-colors hover:border-gold/50 hover:text-gold-light"
            >
              <MessageCircle className="h-4 w-4" aria-hidden />
            </a>

            <a
              href="#booking"
              className="group ms-1 flex h-9 items-center gap-1.5 rounded-full bg-gold-gradient px-4 text-xs font-bold text-ink shadow-gold transition-all duration-300 hover:brightness-110"
            >
              {t("reserve")}
              <ArrowRight
                className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 rtl:rotate-180"
                aria-hidden
              />
            </a>
          </div>

          <button
            type="button"
            className="cursor-pointer rounded-xl border border-white/15 bg-white/8 p-2 text-white backdrop-blur-md md:hidden"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={t("menu")}
            aria-expanded={menuOpen}
          >
            {menuOpen ? (
              <X className="h-5 w-5" aria-hidden />
            ) : (
              <Menu className="h-5 w-5" aria-hidden />
            )}
          </button>
        </div>
      </Container>

      {menuOpen && (
        <div className="border-t border-white/10 bg-ink/95 backdrop-blur-xl md:hidden">
          <Container className="flex flex-col gap-5 py-6">
            <nav className="flex flex-col">
              {NAV_SECTIONS.map((section) => (
                <a
                  key={section.key}
                  href={section.href}
                  onClick={() => setMenuOpen(false)}
                  className="border-b border-white/8 py-3 text-sm font-medium text-white/80"
                >
                  {t(section.key)}
                </a>
              ))}
            </nav>

            <div className="flex flex-wrap gap-2">
              {enabledLocales.map((localeOption) => (
                <button
                  key={localeOption.code}
                  type="button"
                  onClick={() => {
                    router.replace(pathname, { locale: localeOption.code });
                    setMenuOpen(false);
                  }}
                  className={cn(
                    "flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold",
                    currentLocale === localeOption.code
                      ? "bg-gold-gradient text-ink"
                      : "border border-white/15 bg-white/8 text-white/70",
                  )}
                >
                  <span aria-hidden>{getLocaleEmoji(localeOption.code)}</span>
                  {localeOption.shortLabel}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-2">
              <a
                href={`tel:${siteConfig.phone.replace(/\s/g, "")}`}
                className="flex items-center gap-2 text-sm font-medium text-white/80"
              >
                <Phone className="h-4 w-4 text-gold" aria-hidden />
                {siteConfig.phone}
              </a>
              <a
                href="#booking"
                onClick={() => setMenuOpen(false)}
                className="flex h-11 items-center justify-center rounded-xl bg-gold-gradient text-sm font-bold text-ink"
              >
                {t("reserve")}
              </a>
            </div>
          </Container>
        </div>
      )}
    </header>
  );
}
