import { describe, expect, it } from "vitest";

import { recommendVehicles } from "./recommend-vehicles";
import type { VehicleCategoryCapacity } from "../types";

function category(
  overrides: Partial<VehicleCategoryCapacity> & Pick<VehicleCategoryCapacity, "id" | "name">,
): VehicleCategoryCapacity {
  return {
    passengerCapacity: 6,
    largeLuggageCapacity: 6,
    cabinLuggageCapacity: 2,
    isActive: true,
    sortOrder: 0,
    ...overrides,
  };
}

describe("recommendVehicles", () => {
  it("excludes vehicles that cannot fit all passengers in one unit", () => {
    const vehicleCategories = [
      category({ id: "sedan", name: "Sedan", passengerCapacity: 3 }),
      category({ id: "vito", name: "Vito", passengerCapacity: 6 }),
      category({ id: "sprinter", name: "Sprinter", passengerCapacity: 14 }),
    ];

    const recommendations = recommendVehicles({
      passengerCount: 5,
      largeLuggageCount: 0,
      cabinLuggageCount: 0,
      vehicleCategories,
    });

    expect(recommendations.map((item) => item.vehicleCategoryId)).toEqual([
      "sprinter",
      "vito",
    ]);
    expect(recommendations.every((item) => item.quantity === 1)).toBe(true);
  });

  it("still includes ineligible options for cabin luggage overflow when requested", () => {
    const vehicleCategories = [
      category({
        id: "vito",
        name: "Vito",
        passengerCapacity: 8,
        cabinLuggageCapacity: 1,
      }),
    ];

    const recommendations = recommendVehicles(
      {
        passengerCount: 2,
        largeLuggageCount: 0,
        cabinLuggageCount: 20,
        vehicleCategories,
      },
      { includeIneligible: true },
    );

    expect(recommendations).toHaveLength(1);
    expect(recommendations[0]?.assessment.eligibility).toBe("INELIGIBLE");
  });
});
