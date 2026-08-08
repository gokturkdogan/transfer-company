import { describe, expect, it } from "vitest";

import { assessVehicleCapacity } from "./assess-capacity";
import type { LuggageVehicleExtra } from "../types";

const luggageVehicle: LuggageVehicleExtra = {
  id: "luggage-extra-1",
  isActive: true,
  luggageCapacityPerUnit: 20,
  maxQuantity: 5,
};

const baseInput = {
  vehicleQuantity: 1,
  passengerCount: 6,
  largeLuggageCount: 4,
  cabinLuggageCount: 0,
  passengerCapacity: 8,
  largeLuggageCapacity: 8,
  cabinLuggageCapacity: 2,
  luggageVehicleExtra: luggageVehicle,
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

  it("luggage overflow requires one luggage vehicle", () => {
    const result = assessVehicleCapacity({
      ...baseInput,
      largeLuggageCount: 12,
    });

    expect(result.eligibility).toBe("ELIGIBLE_WITH_EXTRAS");
    expect(result.largeLuggageOverflow).toBe(4);
    expect(result.requiredLuggageVehicles).toBe(1);
  });

  it("multiple luggage vehicles required", () => {
    const result = assessVehicleCapacity({
      ...baseInput,
      largeLuggageCount: 28,
    });

    expect(result.eligibility).toBe("ELIGIBLE_WITH_EXTRAS");
    expect(result.largeLuggageOverflow).toBe(20);
    expect(result.requiredLuggageVehicles).toBe(1);

    const multiResult = assessVehicleCapacity({
      ...baseInput,
      largeLuggageCount: 48,
      luggageVehicleExtra: {
        ...luggageVehicle,
        luggageCapacityPerUnit: 20,
      },
    });

    expect(multiResult.requiredLuggageVehicles).toBe(2);
  });

  it("disabled luggage service makes overflow ineligible", () => {
    const result = assessVehicleCapacity({
      ...baseInput,
      largeLuggageCount: 12,
      luggageVehicleExtra: {
        ...luggageVehicle,
        isActive: false,
      },
    });

    expect(result.eligibility).toBe("INELIGIBLE");
    expect(result.warnings.some((w) => w.code === "LUGGAGE_VEHICLE_UNAVAILABLE")).toBe(
      true,
    );
  });
});
