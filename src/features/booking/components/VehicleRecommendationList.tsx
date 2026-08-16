"use client";

import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BookingSearchPrompt } from "@/features/booking/components/BookingSearchPrompt";
import { VehicleRecommendationCard } from "@/features/booking/components/VehicleRecommendationCard";
import { useBookingFlow } from "@/features/booking/context/booking-flow-context";
import {
  getRequiredCapacityPassengerCount,
  getSelectedVehicleQuantity,
  hasSufficientPassengerCapacity,
  requiresMultiVehicleSelection,
  sumSelectedPassengerCapacity,
} from "@/features/booking/lib/vehicle-selection";

export function VehicleRecommendationList() {
  const t = useTranslations("booking.vehicle");
  const { state, dispatch, confirmVehicleSelection } = useBookingFlow();

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
  const coveredPassengers = sumSelectedPassengerCapacity(
    state.selectedVehicles,
    state.quote.options,
  );
  const canContinue =
    state.selectedVehicles.length > 0 &&
    hasSufficientPassengerCapacity(
      state.selectedVehicles,
      state.quote.options,
      requiredPassengers,
    );

  return (
    <div className="space-y-5">
      {multiSelectMode ? (
        <div className="rounded-2xl border border-gold/25 bg-gold/5 px-4 py-3">
          <p className="text-sm font-medium text-foreground">
            {t("multiSelectHint")}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("capacityProgress", {
              covered: coveredPassengers,
              required: requiredPassengers,
            })}
          </p>
        </div>
      ) : null}

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

      {multiSelectMode ? (
        <div className="flex justify-end">
          <Button
            type="button"
            variant="gold"
            size="lg"
            disabled={!canContinue || state.isLoadingQuote}
            onClick={() => void confirmVehicleSelection()}
          >
            {t("continueSelection")}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
