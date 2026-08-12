"use client";

import { Phone } from "lucide-react";
import { useTranslations } from "next-intl";

import { EmailIcon } from "@/components/shared/EmailIcon";
import { WhatsAppIcon } from "@/components/shared/WhatsAppIcon";

import { usePublicContactChannels } from "@/features/contact/components/PublicContactProvider";
import {
  pickPrimaryChannel,
  toMailtoHref,
  toTelHref,
  toWhatsappHref,
} from "@/features/contact/domain/contact-links";
import { cn } from "@/lib/utils";

type ContactCtaProps = {
  tone?: "default" | "onDark";
};

export function ContactCta({ tone = "default" }: ContactCtaProps) {
  const t = useTranslations("contact");
  const contactChannels = usePublicContactChannels();
  const primaryPhone = pickPrimaryChannel(contactChannels.phones, "");
  const primaryWhatsapp = pickPrimaryChannel(contactChannels.whatsapps, "");
  const primaryEmail = pickPrimaryChannel(contactChannels.emails, "");
  const onDark = tone === "onDark";

  return (
    <div className="flex flex-wrap justify-center gap-3">
      <a
        href={toTelHref(primaryPhone)}
        className={cn(
          "inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium",
          onDark
            ? "border-white/25 bg-white/10 text-white hover:bg-white/15"
            : "border-border",
        )}
      >
        <Phone className="h-4 w-4" />
        {primaryPhone}
      </a>
      <a
        href={toWhatsappHref(primaryWhatsapp)}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white"
      >
        <WhatsAppIcon className="h-4 w-4" />
        {t("whatsapp")}
      </a>
      <a
        href={toMailtoHref(primaryEmail)}
        className={cn(
          "inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium",
          onDark
            ? "border-white/25 bg-white/10 text-white hover:bg-white/15"
            : "border-border",
        )}
      >
        <EmailIcon className="h-4 w-4" />
        {primaryEmail}
      </a>
    </div>
  );
}
