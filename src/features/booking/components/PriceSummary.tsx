"use client";

import { useLocale, useTranslations } from "next-intl";

import { formatPrice } from "@/features/booking/lib/format-price";
import type { TransferVehicleOptionDto } from "@/features/pricing/types/dto";

export function PriceSummary({
  option,
  selectionTotalMinor,
  currency,
}: {
  option: TransferVehicleOptionDto | undefined;
  selectionTotalMinor?: number;
  currency: string;
}) {
  const t = useTranslations("booking.review");
  const locale = useLocale();

  if (!option) {
    return null;
  }

  const totalMinor = selectionTotalMinor ?? option.quote.totalMinor;

  return (
    <div className="space-y-2 rounded-lg border border-border p-4 text-sm">
      <div className="flex justify-between gap-4">
        <span>{t("baseTransfer")}</span>
        <span>
          {formatPrice(
            option.quote.baseItems.reduce(
              (sum, item) => sum + item.totalPriceMinor,
              0,
            ),
            currency,
            locale,
          )}
        </span>
      </div>
      {option.requiredExtras.map((extra) => (
        <div key={extra.extraServiceId} className="flex justify-between gap-4">
          <span>{extra.name}</span>
          <span>{formatPrice(extra.totalPriceMinor, currency, locale)}</span>
        </div>
      ))}
      <div className="flex justify-between gap-4 border-t border-border pt-2 text-base font-semibold">
        <span>{t("total")}</span>
        <span>{formatPrice(totalMinor, currency, locale)}</span>
      </div>
    </div>
  );
}
