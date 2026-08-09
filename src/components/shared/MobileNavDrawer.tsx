"use client";

import { ArrowRight, Mail, MessageCircle, Phone, X } from "lucide-react";
import { useTranslations } from "next-intl";

import { getLocaleEmoji } from "@/config/locales";
import { usePublicContactChannels } from "@/features/contact/components/PublicContactProvider";
import {
  toMailtoHref,
  toTelHref,
  toWhatsappHref,
} from "@/features/contact/domain/contact-links";
import type { SiteLocaleOption } from "@/features/locales/types";
import { SiteLogo } from "@/components/shared/SiteLogo";
import { Link, usePathname } from "@/i18n/navigation";
import { useLocaleSwitch } from "@/i18n/use-locale-switch";
import { cn } from "@/lib/utils";

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
  const switchLocale = useLocaleSwitch();
  const contactChannels = usePublicContactChannels();

  return (
    <div
      // Tops every other mobile overlay: sticky summary (60), search sheet (70),
      // sheet popovers (80).
      className={cn(
        "fixed inset-0 z-[90] md:hidden",
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
            className="group flex min-w-0 items-center"
          >
            <SiteLogo alt={common("appName")} size="header" />
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
                {section.type === "route" ? (
                  <Link
                    href={section.href}
                    onClick={onClose}
                    className="flex items-center justify-between rounded-xl px-3 py-3.5 text-sm font-semibold text-white/85 transition-colors hover:bg-white/8 hover:text-white"
                  >
                    {t(section.key)}
                    <ArrowRight
                      className="h-4 w-4 text-gold rtl:rotate-180"
                      aria-hidden
                    />
                  </Link>
                ) : (
                  <a
                    href={resolveNavHref(pathname, section)}
                    onClick={onClose}
                    className="flex items-center justify-between rounded-xl px-3 py-3.5 text-sm font-semibold text-white/85 transition-colors hover:bg-white/8 hover:text-white"
                  >
                    {t(section.key)}
                    <ArrowRight
                      className="h-4 w-4 text-gold rtl:rotate-180"
                      aria-hidden
                    />
                  </a>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className="space-y-3 border-t border-white/10 px-5 py-4">
          {contactChannels.phones.map((phone) => (
            <a
              key={`phone-${phone}`}
              href={toTelHref(phone)}
              className="flex items-center gap-2.5 text-sm font-medium text-white/80 transition-colors hover:text-gold-light"
            >
              <Phone className="h-4 w-4 text-gold" aria-hidden />
              {phone}
            </a>
          ))}
          {contactChannels.whatsapps.map((whatsapp) => (
            <a
              key={`whatsapp-${whatsapp}`}
              href={toWhatsappHref(whatsapp)}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2.5 text-sm font-medium text-white/80 transition-colors hover:text-gold-light"
            >
              <MessageCircle className="h-4 w-4 text-gold" aria-hidden />
              {whatsapp}
            </a>
          ))}
          {contactChannels.emails.map((email) => (
            <a
              key={`email-${email}`}
              href={toMailtoHref(email)}
              className="flex items-center gap-2.5 text-sm font-medium text-white/80 transition-colors hover:text-gold-light"
            >
              <Mail className="h-4 w-4 text-gold" aria-hidden />
              {email}
            </a>
          ))}

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
                  switchLocale(localeOption.code);
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
