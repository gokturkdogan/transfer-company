"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Menu, MessageCircle, Phone, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/Container";
import { LOCALES } from "@/config/constants";
import { siteConfig } from "@/config/site";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

const localeLabels: Record<string, string> = {
  tr: "TR",
  en: "EN",
  de: "DE",
  ru: "RU",
  ar: "AR",
};

export function SiteHeader() {
  const t = useTranslations("home.nav");
  const common = useTranslations("common");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-border/60 bg-white/95 shadow-sm backdrop-blur-md"
          : "bg-transparent",
      )}
    >
      <Container>
        <div className="flex h-16 items-center justify-between md:h-20">
          <Link
            href="/"
            className={cn(
              "text-lg font-semibold tracking-tight transition-colors",
              scrolled ? "text-foreground" : "text-white",
            )}
          >
            {common("appName")}
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            <div className="flex items-center gap-1">
              {LOCALES.map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => router.replace(pathname, { locale: code })}
                  className={cn(
                    "rounded-md px-2 py-1 text-xs font-semibold uppercase tracking-wide transition-colors",
                    locale === code
                      ? scrolled
                        ? "bg-accent text-white"
                        : "bg-white/20 text-white"
                      : scrolled
                        ? "text-muted-foreground hover:text-foreground"
                        : "text-white/70 hover:text-white",
                  )}
                >
                  {localeLabels[code]}
                </button>
              ))}
            </div>

            <a
              href={`tel:${siteConfig.phone.replace(/\s/g, "")}`}
              className={cn(
                "flex items-center gap-2 text-sm font-medium transition-colors",
                scrolled ? "text-foreground" : "text-white",
              )}
            >
              <Phone className="h-4 w-4" />
              <span className="hidden lg:inline">{siteConfig.phone}</span>
            </a>

            <a
              href={`https://wa.me/${siteConfig.whatsapp.replace(/\D/g, "")}`}
              target="_blank"
              rel="noreferrer"
              className={cn(
                "flex items-center gap-2 text-sm font-medium transition-colors",
                scrolled ? "text-foreground" : "text-white",
              )}
            >
              <MessageCircle className="h-4 w-4" />
              <span className="hidden lg:inline">WhatsApp</span>
            </a>

            <Button variant="gold" size="sm" asChild>
              <a href="#booking">{t("reserve")}</a>
            </Button>
          </nav>

          <button
            type="button"
            className={cn(
              "rounded-md p-2 md:hidden",
              scrolled ? "text-foreground" : "text-white",
            )}
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="Menu"
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </Container>

      {menuOpen && (
        <div className="border-t border-border/60 bg-white md:hidden">
          <Container className="flex flex-col gap-4 py-4">
            <div className="flex flex-wrap gap-2">
              {LOCALES.map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => {
                    router.replace(pathname, { locale: code });
                    setMenuOpen(false);
                  }}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-sm font-medium",
                    locale === code
                      ? "bg-accent text-white"
                      : "bg-muted text-foreground",
                  )}
                >
                  {localeLabels[code]}
                </button>
              ))}
            </div>
            <a
              href={`tel:${siteConfig.phone.replace(/\s/g, "")}`}
              className="flex items-center gap-2 text-sm font-medium"
            >
              <Phone className="h-4 w-4" />
              {siteConfig.phone}
            </a>
            <Button variant="gold" asChild className="w-full">
              <a href="#booking" onClick={() => setMenuOpen(false)}>
                {t("reserve")}
              </a>
            </Button>
          </Container>
        </div>
      )}
    </header>
  );
}
