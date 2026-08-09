"use client";

import { useLocale, useTranslations } from "next-intl";

import {
  bookingExtraItemClass,
  bookingExtrasGridClass,
} from "@/features/booking/components/booking-form-styles";
import { formatPrice } from "@/features/booking/lib/format-price";
import type { TransferOptionExtraDto } from "@/features/pricing/types/dto";

export function RequiredExtrasPanel({
  extras,
  currency,
  embedded = false,
}: {
  extras: TransferOptionExtraDto[];
  currency: string;
  embedded?: boolean;
}) {
  const t = useTranslations("booking.extras");
  const locale = useLocale();

  if (extras.length === 0) {
    return null;
  }

  const items = extras.map((extra) => (
    <li key={extra.extraServiceId} className={bookingExtraItemClass}>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">
            {extra.name}
          </p>
          <p className="text-xs text-muted-foreground">
            {t("quantity", { count: extra.quantity })}
          </p>
        </div>
        <div className="shrink-0 text-end">
          <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-gold-deep/80">
            {t("required")}
          </p>
          <p className="text-sm font-medium text-foreground">
            {formatPrice(extra.totalPriceMinor, currency, locale)}
          </p>
        </div>
      </div>
    </li>
  ));

  if (embedded) {
    return <>{items}</>;
  }

  return <ul className={bookingExtrasGridClass}>{items}</ul>;
}
