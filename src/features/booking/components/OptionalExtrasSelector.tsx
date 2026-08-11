"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";

import { CounterField } from "@/features/booking/components/CounterField";
import {
  bookingExtraItemClass,
  bookingExtrasGridClass,
} from "@/features/booking/components/booking-form-styles";
import { useBookingFlow } from "@/features/booking/context/booking-flow-context";
import { formatPrice } from "@/features/booking/lib/format-price";
import { track } from "@/lib/analytics";

type OptionalExtrasSelectorProps = {
  embedded?: boolean;
};

export function OptionalExtrasSelector({
  embedded = false,
}: OptionalExtrasSelectorProps) {
  const t = useTranslations("booking.extras");
  const locale = useLocale();
  const { state, setSelectedExtras } = useBookingFlow();

  const selectedOption = state.quote?.options.find(
    (option) => option.vehicleCategoryId === state.selectedVehicleCategoryId,
  );

  const optionalExtras = selectedOption?.optionalExtras ?? [];

  const quantities = useMemo(() => {
    const map = new Map<string, number>();
    for (const extra of state.selectedExtras) {
      map.set(extra.extraServiceId, extra.quantity);
    }
    return map;
  }, [state.selectedExtras]);

  if (!selectedOption) {
    return null;
  }

  if (optionalExtras.length === 0) {
    return embedded ? null : (
      <p className="text-sm text-muted-foreground">{t("none")}</p>
    );
  }

  const items = optionalExtras.map((extra) => {
    const quantity = quantities.get(extra.extraServiceId) ?? 0;

    return (
      <li key={extra.extraServiceId} className={bookingExtraItemClass}>
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">
              {extra.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {extra.pricingMode === "FIXED" ||
              extra.includedQuantity <= 0
                ? formatPrice(
                    extra.unitPriceMinor,
                    selectedOption.quote.currency,
                    locale,
                  )
                : t("includedPricing", {
                    included: extra.includedQuantity,
                    price: formatPrice(
                      extra.unitPriceMinor,
                      selectedOption.quote.currency,
                      locale,
                    ),
                  })}
            </p>
          </div>
          <CounterField
            label={extra.name}
            value={quantity}
            min={0}
            max={extra.maxQuantity ?? 10}
            variant="inline"
            onChange={(value) => {
              const nextExtras = optionalExtras
                .map((item) => ({
                  extraServiceId: item.extraServiceId,
                  quantity:
                    item.extraServiceId === extra.extraServiceId
                      ? value
                      : (quantities.get(item.extraServiceId) ?? 0),
                }))
                .filter((item) => item.quantity > 0);

              track({
                name: "extra_selected",
                payload: {
                  extraServiceId: extra.extraServiceId,
                  quantity: value,
                },
              });
              setSelectedExtras(nextExtras);
            }}
          />
        </div>
      </li>
    );
  });

  if (embedded) {
    return <>{items}</>;
  }

  return <ul className={bookingExtrasGridClass}>{items}</ul>;
}
