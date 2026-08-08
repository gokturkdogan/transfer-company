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
      <ul className="space-y-5" aria-busy="true">
        <li>
          <Skeleton className="h-52 w-full rounded-[1.35rem]" />
        </li>
        <li>
          <Skeleton className="h-52 w-full rounded-[1.35rem]" />
        </li>
      </ul>
    );
  }

  if (!state.quote) {
    return <p className="text-sm text-muted-foreground">{t("noQuote")}</p>;
  }

  if (state.quote.options.length === 0) {
    return <p className="text-sm text-muted-foreground">{t("empty")}</p>;
  }

  return (
    <ul className="space-y-5">
      {state.quote.options.map((option) => (
        <li key={option.vehicleCategoryId}>
          <VehicleRecommendationCard
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
        </li>
      ))}
    </ul>
  );
}
