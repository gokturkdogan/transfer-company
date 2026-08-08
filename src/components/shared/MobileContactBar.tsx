"use client";

import { CalendarCheck, MessageCircle, Phone } from "lucide-react";
import { useTranslations } from "next-intl";

import { siteConfig } from "@/config/site";

export function MobileContactBar() {
  const t = useTranslations("contact");
  const nav = useTranslations("home.nav");

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-ink/92 px-3 pt-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] backdrop-blur-xl md:hidden">
      <div className="mx-auto flex max-w-3xl gap-2">
        <a
          href={`tel:${siteConfig.phone.replace(/\s/g, "")}`}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/8 py-3 text-xs font-semibold text-white"
        >
          <Phone className="h-4 w-4 text-gold" aria-hidden />
          {t("call")}
        </a>
        <a
          href={`https://wa.me/${siteConfig.whatsapp.replace(/\D/g, "")}`}
          target="_blank"
          rel="noreferrer"
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/8 py-3 text-xs font-semibold text-white"
        >
          <MessageCircle className="h-4 w-4 text-gold" aria-hidden />
          {t("whatsapp")}
        </a>
        <a
          href="#booking"
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gold-gradient py-3 text-xs font-bold text-ink shadow-gold"
        >
          <CalendarCheck className="h-4 w-4" aria-hidden />
          {nav("reserve")}
        </a>
      </div>
    </div>
  );
}
