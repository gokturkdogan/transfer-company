"use client";

import { CalendarCheck, Phone } from "lucide-react";
import { useTranslations } from "next-intl";

import { EmailIcon } from "@/components/shared/EmailIcon";
import { WhatsAppIcon } from "@/components/shared/WhatsAppIcon";
import { Link } from "@/i18n/navigation";

import { usePublicContactChannels } from "@/features/contact/components/PublicContactProvider";
import {
  pickPrimaryChannel,
  toMailtoHref,
  toTelHref,
  toWhatsappHref,
} from "@/features/contact/domain/contact-links";

const actionLinkClassName =
  "flex h-11 items-center justify-center gap-1.5 rounded-xl border border-white/15 bg-white/8 px-2 text-xs font-semibold text-white whitespace-nowrap";

type MobileContactBarProps = {
  variant?: "default" | "booking";
};

export function MobileContactBar({ variant = "default" }: MobileContactBarProps) {
  const t = useTranslations("contact");
  const contactChannels = usePublicContactChannels();
  const primaryPhone = pickPrimaryChannel(contactChannels.phones, "");
  const primaryWhatsapp = pickPrimaryChannel(contactChannels.whatsapps, "");
  const primaryEmail = pickPrimaryChannel(contactChannels.emails, "");

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-ink/92 px-3 pt-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] backdrop-blur-xl md:hidden">
      <div className="mx-auto grid max-w-3xl grid-cols-3 gap-2">
        <a
          href={toTelHref(primaryPhone)}
          className={actionLinkClassName}
        >
          <Phone className="h-4 w-4 shrink-0 text-gold" aria-hidden />
          <span>{t("call")}</span>
        </a>
        <a
          href={toWhatsappHref(primaryWhatsapp)}
          target="_blank"
          rel="noreferrer"
          className={actionLinkClassName}
        >
          <WhatsAppIcon className="h-4 w-4 shrink-0 text-gold" aria-hidden />
          <span>{t("whatsapp")}</span>
        </a>
        {variant === "booking" ? (
          <a
            href={toMailtoHref(primaryEmail)}
            className={actionLinkClassName}
          >
            <EmailIcon className="h-4 w-4 shrink-0 text-gold" aria-hidden />
            <span>{t("email")}</span>
          </a>
        ) : (
          <Link
            href="/booking"
            className="flex h-11 items-center justify-center gap-1.5 rounded-xl bg-gold-gradient px-2 text-xs font-bold text-ink shadow-gold whitespace-nowrap"
          >
            <CalendarCheck className="h-4 w-4 shrink-0" aria-hidden />
            <span>{t("reserve")}</span>
          </Link>
        )}
      </div>
    </div>
  );
}
