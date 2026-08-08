"use client";

import { MessageCircle, Phone } from "lucide-react";

import { siteConfig } from "@/config/site";

export function MobileContactBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 p-3 backdrop-blur md:hidden">
      <div className="mx-auto flex max-w-3xl gap-2">
        <a
          href={`tel:${siteConfig.phone.replace(/\s/g, "")}`}
          className="flex flex-1 items-center justify-center gap-2 rounded-md border border-border py-3 text-sm font-medium"
        >
          <Phone className="h-4 w-4" />
          Call
        </a>
        <a
          href={`https://wa.me/${siteConfig.whatsapp.replace(/\D/g, "")}`}
          target="_blank"
          rel="noreferrer"
          className="flex flex-1 items-center justify-center gap-2 rounded-md bg-emerald-600 py-3 text-sm font-medium text-white"
        >
          <MessageCircle className="h-4 w-4" />
          WhatsApp
        </a>
      </div>
    </div>
  );
}
