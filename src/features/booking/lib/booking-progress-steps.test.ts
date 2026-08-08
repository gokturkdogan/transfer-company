import { describe, expect, it } from "vitest";

import {
  getBookingProgressIndex,
  resolveBookingProgressStep,
} from "@/features/booking/lib/booking-progress-steps";

describe("booking progress steps", () => {
  it("maps legacy extras step to customer", () => {
    expect(resolveBookingProgressStep("extras")).toBe("customer");
  });

  it("hides the progress bar on the success screen", () => {
    expect(resolveBookingProgressStep("success")).toBeNull();
  });

  it("returns stable indices with search leading the flow", () => {
    expect(getBookingProgressIndex("search")).toBe(0);
    expect(getBookingProgressIndex("vehicle")).toBe(1);
    expect(getBookingProgressIndex("customer")).toBe(2);
    expect(getBookingProgressIndex("review")).toBe(3);
  });
});
