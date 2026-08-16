import { describe, expect, it } from "vitest";

import {
  adjustVehicleSelectionQuantity,
  hasSufficientPassengerCapacity,
  requiresMultiVehicleSelection,
  sumSelectedPassengerCapacity,
} from "@/features/booking/lib/vehicle-selection";
import type { TransferVehicleOptionDto } from "@/features/pricing/types/dto";

const options: TransferVehicleOptionDto[] = [
  {
    vehicleCategoryId: "sedan",
    name: "Sedan",
    code: "SEDAN",
    imageKey: null,
    galleryImageKeys: [],
    quantity: 1,
    passengerCapacity: 3,
    largeLuggageCapacity: 3,
    cabinLuggageCapacity: 1,
    eligibility: "ELIGIBLE",
    requiredLuggageVehicles: 0,
    requiredLuggageVehicle: null,
    requiredChildSeats: 0,
    warnings: [],
    requiredExtras: [],
    optionalExtras: [],
    features: [],
    quote: {
      currency: "EUR",
      baseItems: [],
      extraItems: [],
      subtotalMinor: 0,
      totalMinor: 0,
    },
  },
  {
    vehicleCategoryId: "sprinter",
    name: "Sprinter",
    code: "SPRINTER",
    imageKey: null,
    galleryImageKeys: [],
    quantity: 1,
    passengerCapacity: 14,
    largeLuggageCapacity: 14,
    cabinLuggageCapacity: 4,
    eligibility: "ELIGIBLE",
    requiredLuggageVehicles: 0,
    requiredLuggageVehicle: null,
    requiredChildSeats: 0,
    warnings: [],
    requiredExtras: [],
    optionalExtras: [],
    features: [],
    quote: {
      currency: "EUR",
      baseItems: [],
      extraItems: [],
      subtotalMinor: 0,
      totalMinor: 0,
    },
  },
];

describe("vehicle-selection", () => {
  it("detects when multi-vehicle selection is required", () => {
    expect(requiresMultiVehicleSelection(15, options)).toBe(true);
    expect(requiresMultiVehicleSelection(3, options)).toBe(false);
  });

  it("sums passenger capacity across selected vehicles", () => {
    const selected = adjustVehicleSelectionQuantity([], "sedan", 1);
    const withSecond = adjustVehicleSelectionQuantity(selected, "sedan", 1);

    expect(sumSelectedPassengerCapacity(withSecond, options)).toBe(6);
    expect(hasSufficientPassengerCapacity(withSecond, options, 5)).toBe(true);
  });

  it("blocks increases once passenger capacity is filled", () => {
    const filled = adjustVehicleSelectionQuantity([], "sprinter", 1, options, 5);

    expect(sumSelectedPassengerCapacity(filled, options)).toBe(14);
    expect(
      adjustVehicleSelectionQuantity(filled, "sedan", 1, options, 5),
    ).toEqual(filled);
    expect(
      adjustVehicleSelectionQuantity(filled, "sprinter", 1, options, 5),
    ).toEqual(filled);
  });
});
