import { describe, expect, it } from "vitest";

import { buildReservationItems } from "./build-reservation-items";
import type { QuoteLineItem } from "@/features/pricing/types";

describe("buildReservationItems", () => {
  it("copies snapshot values instead of referencing live quote objects", () => {
    const items: QuoteLineItem[] = [
      {
        type: "TRANSFER_VEHICLE",
        referenceId: "vehicle-1",
        name: "Ultra VIP Vito",
        quantity: 1,
        unitPriceMinor: 4500,
        totalPriceMinor: 4500,
      },
      {
        type: "EXTRA_SERVICE",
        referenceId: "extra-1",
        name: "Luggage Vehicle",
        quantity: 1,
        unitPriceMinor: 2500,
        totalPriceMinor: 2500,
      },
    ];

    const reservationItems = buildReservationItems(items, "EUR");

    expect(reservationItems).toHaveLength(2);
    expect(reservationItems[0]).toEqual({
      itemType: "TRANSFER_VEHICLE",
      vehicleCategoryId: "vehicle-1",
      extraServiceId: null,
      snapshotName: "Ultra VIP Vito",
      quantity: 1,
      unitPriceMinor: 4500,
      totalPriceMinor: 4500,
      currency: "EUR",
      sortOrder: 0,
      isLuggageOverflowVehicle: false,
    });

    items[0]!.unitPriceMinor = 9999;
    items[0]!.name = "Changed";

    expect(reservationItems[0]?.unitPriceMinor).toBe(4500);
    expect(reservationItems[0]?.snapshotName).toBe("Ultra VIP Vito");
  });
});
