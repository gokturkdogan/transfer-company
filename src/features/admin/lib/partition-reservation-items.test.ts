import { describe, expect, it } from "vitest";

import {
  partitionReservationLineItems,
  resolveReservationLuggageCount,
} from "./partition-reservation-items";

describe("partitionReservationLineItems", () => {
  it("puts flagged luggage vehicles in extras", () => {
    const { transferVehicles, extraLines } = partitionReservationLineItems([
      {
        itemType: "TRANSFER_VEHICLE",
        snapshotName: "Vito",
        quantity: 1,
        unitPriceMinor: 10000,
        totalPriceMinor: 10000,
        vehicleCategoryId: "vito",
        isLuggageOverflowVehicle: false,
      },
      {
        itemType: "TRANSFER_VEHICLE",
        snapshotName: "Sprinter",
        quantity: 1,
        unitPriceMinor: 3000,
        totalPriceMinor: 3000,
        vehicleCategoryId: "sprinter",
        isLuggageOverflowVehicle: true,
      },
      {
        itemType: "EXTRA_SERVICE",
        snapshotName: "Meet & Greet",
        quantity: 1,
        unitPriceMinor: 2500,
        totalPriceMinor: 2500,
        vehicleCategoryId: null,
        isLuggageOverflowVehicle: false,
      },
    ]);

    expect(transferVehicles).toHaveLength(1);
    expect(transferVehicles[0]?.snapshotName).toBe("Vito");
    expect(extraLines).toHaveLength(2);
    expect(extraLines.find((line) => line.isLuggageOverflowVehicle)?.snapshotName).toBe(
      "Sprinter",
    );
  });

  it("falls back to last vehicle line for legacy reservations", () => {
    const { transferVehicles, extraLines } = partitionReservationLineItems([
      {
        itemType: "TRANSFER_VEHICLE",
        snapshotName: "Vito",
        quantity: 1,
        unitPriceMinor: 10000,
        totalPriceMinor: 10000,
        vehicleCategoryId: "vito",
        isLuggageOverflowVehicle: false,
      },
      {
        itemType: "TRANSFER_VEHICLE",
        snapshotName: "Sprinter",
        quantity: 1,
        unitPriceMinor: 3000,
        totalPriceMinor: 3000,
        vehicleCategoryId: "sprinter",
        isLuggageOverflowVehicle: false,
      },
    ]);

    expect(transferVehicles).toHaveLength(1);
    expect(extraLines).toHaveLength(1);
    expect(extraLines[0]?.isLuggageOverflowVehicle).toBe(true);
  });
});

describe("resolveReservationLuggageCount", () => {
  it("sums legacy cabin luggage into total bagaj", () => {
    expect(resolveReservationLuggageCount(3, 2)).toBe(5);
  });
});
