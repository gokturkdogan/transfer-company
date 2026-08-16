import { describe, expect, it } from "vitest";

import {
  canNavigateToBookingProgressStep,
  isBookingProgressStepReachable,
} from "@/features/booking/lib/booking-progress-steps";
import type { BookingFlowState } from "@/features/booking/lib/types";

function baseState(
  overrides: Partial<BookingFlowState> = {},
): Pick<BookingFlowState, "step" | "quote" | "selectedVehicles"> {
  return {
    step: "vehicle",
    quote: {
      routeId: "route-1",
      currency: "EUR",
      timeZone: "Europe/Istanbul",
      options: [],
    },
    selectedVehicles: [],
    ...overrides,
  };
}

describe("booking progress navigation", () => {
  it("allows navigating back to vehicle when quote exists", () => {
    const state = baseState({
      step: "customer",
      selectedVehicles: [{ vehicleCategoryId: "vito", quantity: 1 }],
    });

    expect(canNavigateToBookingProgressStep(state, "vehicle")).toBe(true);
  });

  it("blocks customer step until a vehicle is selected", () => {
    const state = baseState({ step: "vehicle" });

    expect(isBookingProgressStepReachable(state, "customer")).toBe(false);
    expect(canNavigateToBookingProgressStep(state, "customer")).toBe(false);
  });

  it("allows review when vehicles are selected", () => {
    const state = baseState({
      step: "customer",
      selectedVehicles: [{ vehicleCategoryId: "vito", quantity: 1 }],
    });

    expect(canNavigateToBookingProgressStep(state, "review")).toBe(true);
  });
});
