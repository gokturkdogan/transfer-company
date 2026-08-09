"use client";

import { useTranslations } from "next-intl";

import { BookingOrderSummary } from "@/features/booking/components/BookingOrderSummary";
import { useBookingFlow } from "@/features/booking/context/booking-flow-context";
import { arePassengerDetailsValid } from "@/features/booking/lib/passenger-details";
import { track } from "@/lib/analytics";

type BookingSidebarProps = {
  className?: string;
};

export function BookingSidebar({ className }: BookingSidebarProps) {
  const tActions = useTranslations("booking.actions");
  const tReview = useTranslations("booking.review");
  const { state, dispatch, submitReservation } = useBookingFlow();

  const hasSelection =
    state.quote &&
    state.selectedVehicleCategoryId &&
    state.quote.options.some(
      (option) => option.vehicleCategoryId === state.selectedVehicleCategoryId,
    );

  if ((state.step !== "customer" && state.step !== "review") || !hasSelection) {
    return null;
  }

  const primaryAction =
    state.step === "customer"
      ? {
          label: tActions("continue"),
          disabled: !arePassengerDetailsValid(state.passengers),
          onClick: () =>
            dispatch({
              type: "SET_STEP",
              step: "review",
              idempotencyKey: crypto.randomUUID(),
            }),
        }
      : {
          label: state.isSubmitting ? tReview("submitting") : tReview("submit"),
          onClick: () => {
            track({ name: "booking_review" });
            void submitReservation();
          },
          loading: state.isSubmitting,
        };

  return (
    <BookingOrderSummary className={className} primaryAction={primaryAction} />
  );
}
