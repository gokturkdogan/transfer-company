"use client";

import { Phone } from "lucide-react";
import { useTranslations } from "next-intl";

import { WhatsAppIcon } from "@/components/shared/WhatsAppIcon";
import { usePublicContactChannels } from "@/features/contact/components/PublicContactProvider";
import {
  toTelHref,
  toWhatsappHref,
} from "@/features/contact/domain/contact-links";

export function BookingPricingContactPrompt() {
  const t = useTranslations("booking.vehicle");
  const contactChannels = usePublicContactChannels();

  return (
    <div className="mt-8 rounded-[1.35rem] border border-border/70 bg-muted/25 px-5 py-6 text-center sm:mt-10 sm:px-6">
      <p className="text-base font-semibold text-foreground sm:text-lg">
        {t("pricingContactTitle")}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {t("pricingContactSubtitle")}
      </p>

      <div className="mt-5 flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
        {contactChannels.phones.map((phone) => (
          <a
            key={`phone-${phone}`}
            href={toTelHref(phone)}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-white px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:border-gold/40 hover:text-gold-deep"
          >
            <Phone className="h-4 w-4 shrink-0" aria-hidden />
            {phone}
          </a>
        ))}
        {contactChannels.whatsapps.map((whatsapp) => (
          <a
            key={`whatsapp-${whatsapp}`}
            href={toWhatsappHref(whatsapp)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
          >
            <WhatsAppIcon className="h-4 w-4 shrink-0" aria-hidden />
            {whatsapp}
          </a>
        ))}
      </div>
    </div>
  );
}
