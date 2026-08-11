import { describe, expect, it } from "vitest";

import { resolveRequiredChildSeatQuantity } from "@/features/pricing/domain/required-child-seats";

describe("resolveRequiredChildSeatQuantity", () => {
  const childSeatExtra = {
    id: "child-seat-1",
    isActive: true,
    maxQuantity: 3,
  };

  it("returns zero when there are no infants", () => {
    expect(resolveRequiredChildSeatQuantity(0, childSeatExtra)).toBe(0);
  });

  it("returns infant count capped by max quantity", () => {
    expect(resolveRequiredChildSeatQuantity(2, childSeatExtra)).toBe(2);
    expect(resolveRequiredChildSeatQuantity(5, childSeatExtra)).toBe(3);
  });

  it("returns zero when child seat extra is inactive", () => {
    expect(
      resolveRequiredChildSeatQuantity(2, { ...childSeatExtra, isActive: false }),
    ).toBe(0);
  });
});
