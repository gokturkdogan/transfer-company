"use client";

import { useEffect, useMemo, useRef } from "react";
import { useLocale, useTranslations } from "next-intl";

import { CounterField } from "@/features/booking/components/CounterField";
import { useBookingFlow } from "@/features/booking/context/booking-flow-context";
import { formatPrice } from "@/features/booking/lib/format-price";
import { track } from "@/lib/analytics";

export function OptionalExtrasSelector() {
  const t = useTranslations("booking.extras");
  const locale = useLocale();
  const { state, requestRequote } = useBookingFlow();

  const selectedOption = state.quote?.options.find(
    (option) => option.vehicleCategoryId === state.selectedVehicleCategoryId,
  );

  const optionalExtras = selectedOption?.optionalExtras ?? [];
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const quantities = useMemo(() => {
    const map = new Map<string, number>();
    for (const extra of state.selectedExtras) {
      map.set(extra.extraServiceId, extra.quantity);
    }
    return map;
  }, [state.selectedExtras]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  if (!selectedOption) {
    return null;
  }

  if (optionalExtras.length === 0) {
    return <p className="text-sm text-muted-foreground">{t("none")}</p>;
  }

  return (
    <div className="space-y-4">
      {optionalExtras.map((extra) => {
        const quantity = quantities.get(extra.extraServiceId) ?? 0;

        return (
          <div
            key={extra.extraServiceId}
            className="rounded-lg border border-border p-4"
          >
            <div className="mb-3 flex items-start justify-between gap-4">
              <div>
                <p className="font-medium">{extra.name}</p>
                <p className="text-sm text-muted-foreground">
                  {formatPrice(extra.unitPriceMinor, selectedOption.quote.currency, locale)}
                </p>
              </div>
            </div>
            <CounterField
              label={t("quantityLabel")}
              value={quantity}
              min={0}
              max={extra.maxQuantity ?? 10}
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

                if (debounceRef.current) {
                  clearTimeout(debounceRef.current);
                }

                debounceRef.current = setTimeout(() => {
                  track({
                    name: "extra_selected",
                    payload: {
                      extraServiceId: extra.extraServiceId,
                      quantity: value,
                    },
                  });
                  void requestRequote(nextExtras);
                }, 400);
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
