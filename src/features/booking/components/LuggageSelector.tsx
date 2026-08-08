"use client";

import { useTranslations } from "next-intl";

import { CounterField } from "@/features/booking/components/CounterField";
import { useBookingFlow } from "@/features/booking/context/booking-flow-context";

export function LuggageSelector() {
  const t = useTranslations("booking.luggage");
  const { state, requestQuote } = useBookingFlow();
  const { search } = state;

  const updateLuggage = (patch: {
    largeLuggageCount?: number;
    cabinLuggageCount?: number;
  }) => {
    void requestQuote(patch);
  };

  return (
    <div className="space-y-3 rounded-xl border border-border bg-muted/30 p-4">
      <div>
        <h3 className="text-sm font-semibold">{t("title")}</h3>
        <p className="text-sm text-muted-foreground">{t("description")}</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <CounterField
          label={t("largeLuggage")}
          value={search.largeLuggageCount}
          onChange={(value) => updateLuggage({ largeLuggageCount: value })}
        />
        <CounterField
          label={t("cabinLuggage")}
          value={search.cabinLuggageCount}
          onChange={(value) => updateLuggage({ cabinLuggageCount: value })}
        />
      </div>
    </div>
  );
}
