import { Clock, Phone } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Container } from "@/components/layout/Container";
import { EmailIcon } from "@/components/shared/EmailIcon";
import { SiteLogo } from "@/components/shared/SiteLogo";
import { SocialMediaIconLinks } from "@/components/shared/SocialMediaIconLinks";
import { WhatsAppIcon } from "@/components/shared/WhatsAppIcon";
import { getLocaleEmoji } from "@/config/locales";
import { siteConfig } from "@/config/site";
import {
  toMailtoHref,
  toTelHref,
  toWhatsappHref,
} from "@/features/contact/domain/contact-links";
import { getPublicContactChannels } from "@/features/contact/server/public-contact";
import type { SiteLocaleOption } from "@/features/locales/types";
import { Link } from "@/i18n/navigation";
import { getCachedFooterBacklinks } from "@/server/cache/footer-backlinks";
import { getCachedSocialMediaLinks } from "@/server/cache/social-media";

export async function SiteFooter({
  enabledLocales,
}: {
  enabledLocales: SiteLocaleOption[];
}) {
  const t = await getTranslations("home.footer");
  const nav = await getTranslations("home.nav");
  const common = await getTranslations("common");
  const social = await getTranslations("about.social");
  const contactChannels = await getPublicContactChannels();
  const socialMediaLinks = await getCachedSocialMediaLinks();
  const footerBacklinks = await getCachedFooterBacklinks();

  return (
    <footer className="relative overflow-hidden border-t border-white/10 surface-ink text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 start-1/4 h-[26rem] w-[26rem] animate-aurora rounded-full bg-gold/10 blur-[140px]"
      />

      <Container className="relative py-16 md:py-20">
        <div className="grid gap-12 md:grid-cols-2 xl:grid-cols-3">
          <div className="space-y-5">
            <div className="flex items-center">
              <SiteLogo alt={common("appName")} size="header" />
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-white/55">
              {t("description")}
            </p>
            <div className="flex flex-wrap gap-2">
              {enabledLocales.map((locale) => (
                <Link
                  key={locale.code}
                  href="/"
                  locale={locale.code}
                  className="flex items-center gap-1.5 rounded-full border border-white/12 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/60 transition-colors hover:border-gold/40 hover:text-gold-light"
                >
                  <span aria-hidden>{getLocaleEmoji(locale.code)}</span>
                  {locale.shortLabel}
                </Link>
              ))}
            </div>

            {socialMediaLinks.length > 0 ? (
              <div className="space-y-3 pt-1">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-gold">
                  {social("title")}
                </p>
                <SocialMediaIconLinks
                  links={socialMediaLinks}
                  size="sm"
                  listClassName="justify-start"
                />
              </div>
            ) : null}
          </div>

          <div className="space-y-8">
            <FooterColumn title={t("linksTitle")}>
              <li>
                <Link href="/fleet" className="transition-colors hover:text-gold-light">
                  {nav("fleet")}
                </Link>
              </li>
              <li>
                <Link href="/about" className="transition-colors hover:text-gold-light">
                  {nav("about")}
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="transition-colors hover:text-gold-light">
                  {t("privacyPolicy")}
                </Link>
              </li>
              <li>
                <Link
                  href="/booking"
                  className="transition-colors hover:text-gold-light"
                >
                  {t("bookTransfer")}
                </Link>
              </li>
              <li>
                <Link href="/blog" className="transition-colors hover:text-gold-light">
                  {nav("guides")}
                </Link>
              </li>
            </FooterColumn>

            {footerBacklinks.length > 0 ? (
              <div className="space-y-3">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-gold">
                  {t("linkedSitesTitle")}
                </p>
                <ul className="space-y-2 text-sm text-white/60">
                  {footerBacklinks.map((backlink) => (
                    <li key={backlink.slotIndex}>
                      <a
                        href={backlink.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="transition-colors hover:text-gold-light"
                      >
                        {backlink.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>

          <FooterColumn title={t("contactTitle")}>
            {contactChannels.phones.map((phone) => (
              <li key={`phone-${phone}`}>
                <a
                  href={toTelHref(phone)}
                  className="flex items-center gap-2.5 transition-colors hover:text-gold-light"
                >
                  <Phone className="h-4 w-4 text-gold" aria-hidden />
                  {phone}
                </a>
              </li>
            ))}
            {contactChannels.whatsapps.map((whatsapp) => (
              <li key={`whatsapp-${whatsapp}`}>
                <a
                  href={toWhatsappHref(whatsapp)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2.5 transition-colors hover:text-gold-light"
                >
                  <WhatsAppIcon className="h-4 w-4 text-gold" aria-hidden />
                  {whatsapp}
                </a>
              </li>
            ))}
            {contactChannels.emails.map((email) => (
              <li key={`email-${email}`}>
                <a
                  href={toMailtoHref(email)}
                  className="flex items-center gap-2.5 transition-colors hover:text-gold-light"
                >
                  <EmailIcon className="h-4 w-4 text-gold" aria-hidden />
                  {email}
                </a>
              </li>
            ))}
            <li className="flex items-center gap-2.5">
              <Clock className="h-4 w-4 text-gold" aria-hidden />
              {siteConfig.supportHours}
            </li>
          </FooterColumn>
        </div>

        <div className="mt-14 border-t border-white/8 pt-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col gap-4">
              <p className="text-xs text-white/40">
                {t("copyright", {
                  year: new Date().getFullYear(),
                  appName: common("appName"),
                })}
              </p>
            </div>
            <p className="text-center text-xs tracking-[0.14em] uppercase text-white/40 sm:text-end">
              {t("tagline")}
            </p>
          </div>
        </div>
      </Container>
    </footer>
  );
}

function FooterColumn({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-gold">
        {title}
      </p>
      <ul className="space-y-3 text-sm text-white/60">{children}</ul>
    </div>
  );
}
