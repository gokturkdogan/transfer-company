import { describe, expect, it } from "vitest";

import {
  calculateExtraTotalMinor,
  resolveBillableExtraQuantity,
} from "./extra-pricing";

describe("extra-pricing", () => {
  it("charges per unit without included quantity", () => {
    expect(
      resolveBillableExtraQuantity("PER_UNIT", 3, 0),
    ).toBe(3);
    expect(
      calculateExtraTotalMinor({
        pricingMode: "PER_UNIT",
        quantity: 3,
        unitPriceMinor: 500,
        includedQuantity: 0,
      }),
    ).toBe(1500);
  });

  it("waives included units for per-unit extras", () => {
    expect(
      resolveBillableExtraQuantity("PER_UNIT", 3, 1),
    ).toBe(2);
    expect(
      calculateExtraTotalMinor({
        pricingMode: "PER_UNIT",
        quantity: 3,
        unitPriceMinor: 500,
        includedQuantity: 1,
      }),
    ).toBe(1000);
  });

  it("charges nothing when quantity is within included allowance", () => {
    expect(
      calculateExtraTotalMinor({
        pricingMode: "PER_UNIT",
        quantity: 1,
        unitPriceMinor: 500,
        includedQuantity: 1,
      }),
    ).toBe(0);
  });

  it("ignores included quantity for fixed extras", () => {
    expect(
      calculateExtraTotalMinor({
        pricingMode: "FIXED",
        quantity: 3,
        unitPriceMinor: 1500,
        includedQuantity: 1,
      }),
    ).toBe(1500);
  });
});
