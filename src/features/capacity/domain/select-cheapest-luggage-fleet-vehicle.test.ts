import { describe, expect, it } from "vitest";

import { selectCheapestLuggageFleetVehicle } from "@/features/capacity/domain/select-cheapest-luggage-fleet-vehicle";

const candidates = [
  {
    vehicleCategoryId: "sedan",
    vehicleCategoryName: "Sedan",
    largeLuggageCapacity: 4,
    oneWayPriceMinor: 10_000,
    roundTripPriceMinor: 18_000,
    priceIsActive: true,
  },
  {
    vehicleCategoryId: "vito",
    vehicleCategoryName: "Vito",
    largeLuggageCapacity: 8,
    oneWayPriceMinor: 15_000,
    roundTripPriceMinor: 28_000,
    priceIsActive: true,
  },
  {
    vehicleCategoryId: "sprinter",
    vehicleCategoryName: "Sprinter",
    largeLuggageCapacity: 12,
    oneWayPriceMinor: 20_000,
    roundTripPriceMinor: 36_000,
    priceIsActive: true,
  },
];

describe("selectCheapestLuggageFleetVehicle", () => {
  it("selects the cheapest fleet option for overflow luggage", () => {
    const result = selectCheapestLuggageFleetVehicle(4, candidates, "ONE_WAY");

    expect(result).toMatchObject({
      vehicleCategoryId: "sedan",
      quantity: 1,
      totalPriceMinor: 10_000,
    });
  });

  it("uses multiple units when a single vehicle is not enough", () => {
    const result = selectCheapestLuggageFleetVehicle(9, candidates, "ONE_WAY");

    expect(result).toMatchObject({
      vehicleCategoryId: "sprinter",
      quantity: 1,
      totalPriceMinor: 20_000,
    });
  });

  it("returns null when no priced fleet vehicle can carry luggage", () => {
    expect(
      selectCheapestLuggageFleetVehicle(4, [], "ONE_WAY"),
    ).toBeNull();
  });
});
