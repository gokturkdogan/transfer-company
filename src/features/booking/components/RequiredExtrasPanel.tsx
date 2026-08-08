"use client";

import { useLocale, useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/features/booking/lib/format-price";
import type { TransferOptionExtraDto } from "@/features/pricing/types/dto";

export function RequiredExtrasPanel({
  extras,
  currency,
}: {
  extras: TransferOptionExtraDto[];
  currency: string;
}) {
  const t = useTranslations("booking.extras");
  const locale = useLocale();

  if (extras.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
      <p className="text-sm font-medium text-amber-900">{t("requiredTitle")}</p>
      {extras.map((extra) => (
        <div
          key={extra.extraServiceId}
          className="flex items-center justify-between gap-4 text-sm"
        >
          <div className="space-y-1">
            <p className="font-medium">{extra.name}</p>
            <p className="text-muted-foreground">
              {t("quantity", { count: extra.quantity })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="warning">{t("required")}</Badge>
            <span className="font-semibold">
              {formatPrice(extra.totalPriceMinor, currency, locale)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
