"use client";

import { Luggage } from "lucide-react";
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
    <div className="rounded-[1.25rem] border border-border/70 bg-muted/30 p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold/15 text-gold">
            <Luggage className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <h3 className="text-sm font-bold text-foreground">{t("title")}</h3>
            <p className="text-sm text-muted-foreground">{t("description")}</p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:max-w-md lg:flex-1">
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
    </div>
  );
}
