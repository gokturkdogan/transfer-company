import { describe, expect, it } from "vitest";

import { assessVehicleCapacity } from "./assess-capacity";

const baseInput = {
  vehicleQuantity: 1,
  passengerCount: 6,
  largeLuggageCount: 4,
  cabinLuggageCount: 0,
  passengerCapacity: 8,
  largeLuggageCapacity: 8,
  cabinLuggageCapacity: 2,
};

describe("assessVehicleCapacity", () => {
  it("passenger capacity valid", () => {
    const result = assessVehicleCapacity(baseInput);
    expect(result.eligibility).toBe("ELIGIBLE");
    expect(result.passengerOverflow).toBe(0);
  });

  it("passenger capacity exceeded", () => {
    const result = assessVehicleCapacity({
      ...baseInput,
      passengerCount: 10,
    });

    expect(result.eligibility).toBe("INELIGIBLE");
    expect(result.passengerOverflow).toBe(2);
    expect(result.requiredLuggageVehicles).toBe(0);
  });

  it("luggage within capacity", () => {
    const result = assessVehicleCapacity({
      ...baseInput,
      largeLuggageCount: 8,
    });

    expect(result.eligibility).toBe("ELIGIBLE");
    expect(result.largeLuggageOverflow).toBe(0);
  });

  it("luggage overflow is eligible with extras until fleet resolution", () => {
    const result = assessVehicleCapacity({
      ...baseInput,
      largeLuggageCount: 12,
    });

    expect(result.eligibility).toBe("ELIGIBLE_WITH_EXTRAS");
    expect(result.largeLuggageOverflow).toBe(4);
    expect(result.requiredLuggageVehicles).toBe(0);
    expect(
      result.warnings.some((warning) => warning.code === "LUGGAGE_VEHICLE_REQUIRED"),
    ).toBe(true);
  });
});
