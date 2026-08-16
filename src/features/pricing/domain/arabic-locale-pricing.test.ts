import { describe, expect, it } from "vitest";

import {
  applyPriceMultiplier,
  resolveArabicPricingAdjustments,
  resolveExtraUnitPriceMinor,
} from "./arabic-locale-pricing";

describe("arabic-locale-pricing", () => {
  it("returns adjustments only for Arabic locale", () => {
    expect(resolveArabicPricingAdjustments("ar")).toEqual({
      extraPriceMultiplier: 2,
      luggageVehiclePriceMultiplier: 2,
    });
    expect(resolveArabicPricingAdjustments("tr")).toBeNull();
    expect(resolveArabicPricingAdjustments("en")).toBeNull();
  });

  it("applies extra multiplier for Arabic catalogue prices", () => {
    const adjustments = resolveArabicPricingAdjustments("ar");

    expect(resolveExtraUnitPriceMinor(1500, adjustments)).toBe(3000);
    expect(resolveExtraUnitPriceMinor(1500, null)).toBe(1500);
  });

  it("applies vehicle multiplier", () => {
    expect(applyPriceMultiplier(4500, 2)).toBe(9000);
    expect(applyPriceMultiplier(4500, 1)).toBe(4500);
  });
});
