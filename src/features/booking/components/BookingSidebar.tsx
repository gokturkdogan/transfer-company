"use client";

import { useTranslations } from "next-intl";

import { BookingOrderSummary } from "@/features/booking/components/BookingOrderSummary";
import { useBookingFlow } from "@/features/booking/context/booking-flow-context";
import { getCustomerStepValidationIssue } from "@/features/booking/lib/customer-step-validation";
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
    state.selectedVehicles.length > 0 &&
    state.selectedVehicles.every((selection) =>
      state.quote!.options.some(
        (option) => option.vehicleCategoryId === selection.vehicleCategoryId,
      ),
    );

  if ((state.step !== "customer" && state.step !== "review") || !hasSelection) {
    return null;
  }

  const primaryAction =
    state.step === "customer"
      ? {
          label: tActions("continue"),
          disabled: state.isLoadingQuote,
          onClick: () => {
            const issue = getCustomerStepValidationIssue(state);

            if (issue) {
              dispatch({
                type: "FLOW_ERROR",
                errorKey: issue.errorKey,
                fieldHighlight: issue.fieldHighlight,
              });
              return;
            }

            dispatch({
              type: "SET_STEP",
              step: "review",
              idempotencyKey: crypto.randomUUID(),
            });
          },
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
