"use client";

import { useTranslations } from "next-intl";

import { Skeleton } from "@/components/ui/skeleton";
import { BookingSearchPrompt } from "@/features/booking/components/BookingSearchPrompt";
import { VehicleRecommendationCard } from "@/features/booking/components/VehicleRecommendationCard";
import { useBookingFlow } from "@/features/booking/context/booking-flow-context";
import {
  getRequiredCapacityPassengerCount,
  getSelectedVehicleQuantity,
  isPassengerCapacityFilled,
  requiresMultiVehicleSelection,
} from "@/features/booking/lib/vehicle-selection";

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
    return <BookingSearchPrompt />;
  }

  if (state.quote.options.length === 0) {
    return <p className="text-sm text-muted-foreground">{t("empty")}</p>;
  }

  const requiredPassengers = getRequiredCapacityPassengerCount(state.search);
  const multiSelectMode = requiresMultiVehicleSelection(
    requiredPassengers,
    state.quote.options,
  );
  const capacityFilled = isPassengerCapacityFilled(
    state.selectedVehicles,
    state.quote.options,
    requiredPassengers,
  );

  return (
    <ul className="space-y-5">
      {state.quote.options.map((option) => {
        const selectedQuantity = getSelectedVehicleQuantity(
          state.selectedVehicles,
          option.vehicleCategoryId,
        );

        return (
          <li key={option.vehicleCategoryId}>
            <VehicleRecommendationCard
              option={option}
              multiSelectMode={multiSelectMode}
              selectedQuantity={selectedQuantity}
              selected={selectedQuantity > 0}
              disabled={option.eligibility === "INELIGIBLE"}
              capacityFilled={capacityFilled}
              onSelect={() =>
                dispatch({
                  type: "SELECT_VEHICLE",
                  vehicleCategoryId: option.vehicleCategoryId,
                  quantity: 1,
                })
              }
              onToggle={() =>
                dispatch({
                  type: "ADJUST_VEHICLE_SELECTION",
                  vehicleCategoryId: option.vehicleCategoryId,
                  delta: selectedQuantity > 0 ? -selectedQuantity : 1,
                })
              }
              onAdjustQuantity={(delta) =>
                dispatch({
                  type: "ADJUST_VEHICLE_SELECTION",
                  vehicleCategoryId: option.vehicleCategoryId,
                  delta,
                })
              }
            />
          </li>
        );
      })}
    </ul>
  );
}
