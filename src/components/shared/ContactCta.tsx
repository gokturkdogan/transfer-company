"use client";

import { MessageCircle, Phone } from "lucide-react";
import { useTranslations } from "next-intl";

import { siteConfig } from "@/config/site";

export function ContactCta() {
  const t = useTranslations("contact");

  return (
    <div className="flex flex-wrap justify-center gap-3">
      <a
        href={`tel:${siteConfig.phone.replace(/\s/g, "")}`}
        className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium"
      >
        <Phone className="h-4 w-4" />
        {siteConfig.phone}
      </a>
      <a
        href={`https://wa.me/${siteConfig.whatsapp.replace(/\D/g, "")}`}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white"
      >
        <MessageCircle className="h-4 w-4" />
        {t("whatsapp")}
      </a>
    </div>
  );
}
