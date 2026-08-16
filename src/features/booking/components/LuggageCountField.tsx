"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

import { CounterField } from "@/features/booking/components/CounterField";
import { useBookingFlow } from "@/features/booking/context/booking-flow-context";
import { sumSelectedLargeLuggageCapacity } from "@/features/booking/lib/vehicle-selection-context";

export function LuggageCountField() {
  const t = useTranslations("booking.transfer");
  const { state, updateLuggageCount } = useBookingFlow();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [luggageCount, setLuggageCount] = useState(state.search.largeLuggageCount);

  useEffect(() => {
    setLuggageCount(state.search.largeLuggageCount);
  }, [state.search.largeLuggageCount]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  if (!state.quote || state.selectedVehicles.length === 0) {
    return null;
  }

  const capacity = sumSelectedLargeLuggageCapacity(
    state.selectedVehicles,
    state.quote.options,
  );

  return (
    <div className="space-y-2 lg:max-w-sm">
      <CounterField
        label={t("totalLuggage")}
        value={luggageCount}
        min={0}
        max={99}
        onChange={(value) => {
          setLuggageCount(value);

          if (debounceRef.current) {
            clearTimeout(debounceRef.current);
          }

          const previouslyOver = state.search.largeLuggageCount > capacity;
          const nextOver = value > capacity;
          const delay = previouslyOver || nextOver ? 400 : 0;

          debounceRef.current = setTimeout(() => {
            void updateLuggageCount(value);
          }, delay);
        }}
      />
      <p className="text-xs text-muted-foreground">
        {t("luggageCapacityHint", { capacity })}
      </p>
      {state.isLoadingQuote ? (
        <p className="text-sm text-muted-foreground">{t("updatingLuggage")}</p>
      ) : null}
    </div>
  );
}
