"use client";

import { ArrowRight, Mail, MessageCircle, Phone, X } from "lucide-react";
import { useTranslations } from "next-intl";

import { getLocaleEmoji } from "@/config/locales";
import { siteConfig } from "@/config/site";
import type { SiteLocaleOption } from "@/features/locales/types";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

const NAV_SECTIONS = [
  { key: "destinations", href: "#destinations" },
  { key: "fleet", href: "#fleet" },
  { key: "howItWorks", href: "#how-it-works" },
  { key: "faq", href: "#faq" },
] as const;

type MobileNavDrawerProps = {
  open: boolean;
  onClose: () => void;
  enabledLocales: SiteLocaleOption[];
  currentLocale: string;
};

export function MobileNavDrawer({
  open,
  onClose,
  enabledLocales,
  currentLocale,
}: MobileNavDrawerProps) {
  const t = useTranslations("home.nav");
  const footer = useTranslations("home.footer");
  const common = useTranslations("common");
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div
      className={cn(
        "fixed inset-0 z-[60] md:hidden",
        open ? "pointer-events-auto" : "pointer-events-none",
      )}
      aria-hidden={!open}
    >
      {/* Overlay */}
      <button
        type="button"
        aria-label={t("close")}
        tabIndex={open ? 0 : -1}
        onClick={onClose}
        className={cn(
          "absolute inset-0 cursor-pointer bg-black/55 backdrop-blur-[2px] transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0",
        )}
      />

      {/* Drawer panel — slides from the inline end (right in LTR) */}
      <aside
        id="mobile-nav-drawer"
        role="dialog"
        aria-modal="true"
        aria-label={t("menu")}
        className={cn(
          "absolute inset-y-0 end-0 flex w-[80%] max-w-[22rem] flex-col",
          "surface-ink text-white shadow-premium",
          "transition-transform duration-300 ease-out",
          open
            ? "translate-x-0"
            : "translate-x-full rtl:-translate-x-full",
        )}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 start-0 w-px bg-gradient-to-b from-gold/50 via-gold/25 to-transparent"
        />

        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
          <Link
            href="/"
            onClick={onClose}
            className="group flex min-w-0 items-center gap-2.5"
          >
            <span
              aria-hidden
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gold-gradient text-sm font-bold text-ink shadow-gold"
            >
              VT
            </span>
            <span className="truncate text-base font-bold tracking-tight">
              {common("appName")}
            </span>
          </Link>
          <button
            type="button"
            aria-label={t("close")}
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-white/15 bg-white/8 text-white transition-colors hover:border-gold/50 hover:text-gold-light"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">
            {NAV_SECTIONS.map((section) => (
              <li key={section.key}>
                <a
                  href={section.href}
                  onClick={onClose}
                  className="flex items-center justify-between rounded-xl px-3 py-3.5 text-sm font-semibold text-white/85 transition-colors hover:bg-white/8 hover:text-white"
                >
                  {t(section.key)}
                  <ArrowRight
                    className="h-4 w-4 text-gold rtl:rotate-180"
                    aria-hidden
                  />
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className="space-y-3 border-t border-white/10 px-5 py-4">
          <a
            href={`tel:${siteConfig.phone.replace(/\s/g, "")}`}
            className="flex items-center gap-2.5 text-sm font-medium text-white/80 transition-colors hover:text-gold-light"
          >
            <Phone className="h-4 w-4 text-gold" aria-hidden />
            {siteConfig.phone}
          </a>
          <a
            href={`https://wa.me/${siteConfig.whatsapp.replace(/\D/g, "")}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2.5 text-sm font-medium text-white/80 transition-colors hover:text-gold-light"
          >
            <MessageCircle className="h-4 w-4 text-gold" aria-hidden />
            WhatsApp
          </a>
          <a
            href={`mailto:${siteConfig.email}`}
            className="flex items-center gap-2.5 text-sm font-medium text-white/80 transition-colors hover:text-gold-light"
          >
            <Mail className="h-4 w-4 text-gold" aria-hidden />
            {siteConfig.email}
          </a>

          <div
            className="flex gap-1"
            role="group"
            aria-label={footer("languagesTitle")}
          >
            {enabledLocales.map((localeOption) => (
              <button
                key={localeOption.code}
                type="button"
                title={localeOption.label}
                onClick={() => {
                  router.replace(pathname, { locale: localeOption.code });
                  onClose();
                }}
                className={cn(
                  "flex min-w-0 flex-1 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-lg border py-2 transition-colors",
                  currentLocale === localeOption.code
                    ? "border-gold/50 bg-gold-gradient text-ink shadow-gold"
                    : "border-white/12 bg-white/5 text-white/75 hover:border-gold/35 hover:bg-white/10",
                )}
              >
                <span className="text-sm leading-none" aria-hidden>
                  {getLocaleEmoji(localeOption.code)}
                </span>
                <span className="text-[9px] font-bold uppercase leading-none tracking-wide">
                  {localeOption.shortLabel}
                </span>
              </button>
            ))}
          </div>

          <a
            href="#booking"
            onClick={onClose}
            className="flex h-11 items-center justify-center gap-2 rounded-xl bg-gold-gradient text-sm font-bold text-ink shadow-gold transition-all hover:brightness-110"
          >
            {t("reserve")}
            <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
          </a>

          <p className="pt-1 text-center text-[10px] tracking-wide text-white/40">
            {footer("tagline")}
          </p>
        </div>
      </aside>
    </div>
  );
}
