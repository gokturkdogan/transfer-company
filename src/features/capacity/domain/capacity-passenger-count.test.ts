import { describe, expect, it } from "vitest";

import { resolveCapacityPassengerCount } from "./capacity-passenger-count";

describe("resolveCapacityPassengerCount", () => {
  it("sums adults, children, and infants", () => {
    expect(resolveCapacityPassengerCount(3, 2)).toBe(5);
  });

  it("defaults infant count to zero", () => {
    expect(resolveCapacityPassengerCount(4)).toBe(4);
  });
});
