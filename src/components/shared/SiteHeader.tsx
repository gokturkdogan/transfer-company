"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ArrowRight, Menu, MessageCircle, Phone } from "lucide-react";

import { Container } from "@/components/layout/Container";
import { LocaleSwitcher } from "@/components/shared/LocaleSwitcher";
import { MobileNavDrawer } from "@/components/shared/MobileNavDrawer";
import { SiteLogo } from "@/components/shared/SiteLogo";
import type { SiteLocaleOption } from "@/features/locales/types";
import { Link, usePathname } from "@/i18n/navigation";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

type SiteHeaderProps = {
  enabledLocales: SiteLocaleOption[];
};

const NAV_SECTIONS = [
  { key: "about", href: "/about", type: "route" },
  { key: "destinations", href: "#destinations", type: "hash" },
  { key: "fleet", href: "#fleet", type: "hash" },
  { key: "howItWorks", href: "#how-it-works", type: "hash" },
  { key: "faq", href: "#faq", type: "hash" },
] as const;

function resolveNavHref(
  pathname: string,
  section: (typeof NAV_SECTIONS)[number],
): string {
  if (section.type === "route") {
    return section.href;
  }

  return pathname === "/" ? section.href : `/${section.href}`;
}

export function SiteHeader({ enabledLocales }: SiteHeaderProps) {
  const t = useTranslations("home.nav");
  const common = useTranslations("common");
  const currentLocale = useLocale();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-500",
          scrolled
            ? "border-b border-white/10 bg-ink/85 shadow-premium backdrop-blur-xl"
            : "bg-transparent",
        )}
      >
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
              scrolled ? "h-[4.5rem]" : "h-24 md:h-32",
            )}
          >
            <Link href="/" className="group flex shrink-0 items-center">
              <SiteLogo alt={common("appName")} size="header" />
            </Link>

            <nav className="hidden items-center gap-1 xl:flex">
              {NAV_SECTIONS.map((section) =>
                section.type === "route" ? (
                  <Link
                    key={section.key}
                    href={section.href}
                    className="rounded-full px-3.5 py-2 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    {t(section.key)}
                  </Link>
                ) : (
                  <a
                    key={section.key}
                    href={resolveNavHref(pathname, section)}
                    className="rounded-full px-3.5 py-2 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    {t(section.key)}
                  </a>
                ),
              )}
            </nav>

            <div className="hidden items-center gap-2 md:flex">
              <LocaleSwitcher enabledLocales={enabledLocales} />

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

            <div className="flex items-center gap-2 md:hidden">
              <LocaleSwitcher enabledLocales={enabledLocales} />

              <button
                type="button"
                className="cursor-pointer rounded-xl border border-white/15 bg-white/8 p-2 text-white backdrop-blur-md"
                onClick={() => setMenuOpen(true)}
                aria-label={t("menu")}
                aria-expanded={menuOpen}
                aria-controls="mobile-nav-drawer"
              >
                <Menu className="h-5 w-5" aria-hidden />
              </button>
            </div>
          </div>
        </Container>
      </header>

      <MobileNavDrawer
        open={menuOpen}
        enabledLocales={enabledLocales}
        currentLocale={currentLocale}
        onClose={() => setMenuOpen(false)}
      />
    </>
  );
}
