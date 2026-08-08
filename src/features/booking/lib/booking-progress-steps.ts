import type { BookingStep } from "@/features/booking/lib/types";

export const BOOKING_PROGRESS_STEPS = [
  "search",
  "vehicle",
  "customer",
  "review",
] as const;

export type BookingProgressStep = (typeof BOOKING_PROGRESS_STEPS)[number];

/** Maps flow steps onto the four visible progress markers. */
export function resolveBookingProgressStep(
  step: BookingStep,
): BookingProgressStep | null {
  if (step === "success") {
    return null;
  }

  if (step === "extras") {
    return "customer";
  }

  return step;
}

export function getBookingProgressIndex(step: BookingProgressStep): number {
  return BOOKING_PROGRESS_STEPS.indexOf(step);
}
