"use client";

import { ShieldCheck, Clock, Car, CreditCard } from "lucide-react";
import { useTranslations } from "next-intl";

const ICONS = [ShieldCheck, Clock, Car, CreditCard] as const;

export function TrustSignals() {
  const t = useTranslations("trust");

  const items = ["fixedPrice", "support", "professional", "noPayment"] as const;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item, index) => {
        const Icon = ICONS[index] ?? ShieldCheck;
        return (
          <div
            key={item}
            className="rounded-xl border border-border bg-background p-4 text-start"
          >
            <Icon className="mb-2 h-5 w-5 text-primary" />
            <p className="text-sm font-medium">{t(`${item}.title`)}</p>
            <p className="text-sm text-muted-foreground">{t(`${item}.description`)}</p>
          </div>
        );
      })}
    </div>
  );
}
