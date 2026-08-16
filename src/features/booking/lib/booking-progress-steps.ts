import type { BookingFlowState, BookingStep } from "@/features/booking/lib/types";

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

export function mapProgressStepToBookingStep(
  step: BookingProgressStep,
): BookingStep {
  return step;
}

export function isBookingProgressStepReachable(
  state: Pick<BookingFlowState, "quote" | "selectedVehicles">,
  step: BookingProgressStep,
): boolean {
  switch (step) {
    case "search":
      return true;
    case "vehicle":
      return state.quote !== null;
    case "customer":
    case "review":
      return state.selectedVehicles.length > 0;
    default:
      return false;
  }
}

export function canNavigateToBookingProgressStep(
  state: Pick<BookingFlowState, "step" | "quote" | "selectedVehicles">,
  target: BookingProgressStep,
): boolean {
  const currentProgress = resolveBookingProgressStep(state.step);

  if (!currentProgress) {
    return false;
  }

  const targetIndex = getBookingProgressIndex(target);
  const currentIndex = getBookingProgressIndex(currentProgress);

  if (targetIndex <= currentIndex) {
    return isBookingProgressStepReachable(state, target);
  }

  for (let index = 0; index <= targetIndex; index += 1) {
    const step = BOOKING_PROGRESS_STEPS[index];

    if (!isBookingProgressStepReachable(state, step)) {
      return false;
    }
  }

  return true;
}
