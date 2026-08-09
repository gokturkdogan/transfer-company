"use client";

import { Phone } from "lucide-react";
import { useTranslations } from "next-intl";

import { WhatsAppIcon } from "@/components/shared/WhatsAppIcon";

import { usePublicContactChannels } from "@/features/contact/components/PublicContactProvider";
import {
  pickPrimaryChannel,
  toTelHref,
  toWhatsappHref,
} from "@/features/contact/domain/contact-links";

export function ContactCta() {
  const t = useTranslations("contact");
  const contactChannels = usePublicContactChannels();
  const primaryPhone = pickPrimaryChannel(contactChannels.phones, "");
  const primaryWhatsapp = pickPrimaryChannel(contactChannels.whatsapps, "");

  return (
    <div className="flex flex-wrap justify-center gap-3">
      <a
        href={toTelHref(primaryPhone)}
        className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium"
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
    </div>
  );
}
