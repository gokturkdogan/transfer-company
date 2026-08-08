"use client";

import { useTranslations } from "next-intl";

import { Skeleton } from "@/components/ui/skeleton";
import { VehicleRecommendationCard } from "@/features/booking/components/VehicleRecommendationCard";
import { useBookingFlow } from "@/features/booking/context/booking-flow-context";

export function VehicleRecommendationList() {
  const t = useTranslations("booking.vehicle");
  const { state, dispatch } = useBookingFlow();

  if (state.isLoadingQuote) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!state.quote) {
    return <p className="text-sm text-muted-foreground">{t("noQuote")}</p>;
  }

  if (state.quote.options.length === 0) {
    return <p className="text-sm text-muted-foreground">{t("empty")}</p>;
  }

  return (
    <div className="space-y-4">
      {state.quote.options.map((option) => (
        <VehicleRecommendationCard
          key={option.vehicleCategoryId}
          option={option}
          selected={state.selectedVehicleCategoryId === option.vehicleCategoryId}
          disabled={option.eligibility === "INELIGIBLE"}
          onSelect={() =>
            dispatch({
              type: "SELECT_VEHICLE",
              vehicleCategoryId: option.vehicleCategoryId,
              quantity: option.quantity,
            })
          }
        />
      ))}
    </div>
  );
}
