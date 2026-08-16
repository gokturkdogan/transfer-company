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
  const baseTransferMinor = option.quote.baseItems
    .filter((item) => !item.isLuggageOverflowVehicle)
    .reduce((sum, item) => sum + item.totalPriceMinor, 0);

  const luggageVehicleLine = option.quote.baseItems.find(
    (item) => item.isLuggageOverflowVehicle,
  );

  const extraLines: Array<{ id: string; name: string; totalPriceMinor: number }> =
    option.requiredExtras.map((extra) => ({
      id: extra.extraServiceId,
      name: extra.name,
      totalPriceMinor: extra.totalPriceMinor,
    }));

  if (luggageVehicleLine) {
    extraLines.push({
      id: `luggage-vehicle:${luggageVehicleLine.referenceId}`,
      name: luggageVehicleLine.name,
      totalPriceMinor: luggageVehicleLine.totalPriceMinor,
    });
  } else if (option.requiredLuggageVehicle) {
    extraLines.push({
      id: `luggage-vehicle:${option.requiredLuggageVehicle.vehicleCategoryId}`,
      name: option.requiredLuggageVehicle.vehicleCategoryName,
      totalPriceMinor: option.requiredLuggageVehicle.totalPriceMinor,
    });
  }

  return (
    <div className="space-y-3 rounded-[1.25rem] border border-border/70 bg-muted/35 p-5 text-sm shadow-float">
      <div className="flex justify-between gap-4">
        <span>{t("baseTransfer")}</span>
        <span>
          {formatPrice(baseTransferMinor, currency, locale)}
        </span>
      </div>
      {extraLines.map((extra) => (
        <div key={extra.id} className="flex justify-between gap-4">
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
