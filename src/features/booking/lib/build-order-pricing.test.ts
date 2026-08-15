import { describe, expect, it } from "vitest";

import { buildOrderPricing } from "@/features/booking/lib/build-order-pricing";
import type { TransferAvailabilityResponseDto } from "@/features/pricing/types/dto";

const quoteFixture: TransferAvailabilityResponseDto = {
  routeId: "route-1",
  currency: "EUR",
  timeZone: "Europe/Istanbul",
  options: [
    {
      vehicleCategoryId: "vehicle-1",
      name: "Vito",
      code: "VITO",
      imageKey: null,
      galleryImageKeys: [],
      quantity: 1,
      passengerCapacity: 8,
      largeLuggageCapacity: 8,
      cabinLuggageCapacity: 2,
      eligibility: "ELIGIBLE",
      requiredLuggageVehicles: 0,
      requiredLuggageVehicle: null,
      requiredChildSeats: 1,
      warnings: [],
      requiredExtras: [
        {
          extraServiceId: "child-seat",
          name: "Child Seat",
          pricingMode: "PER_UNIT",
          quantity: 1,
          maxQuantity: 5,
          includedQuantity: 1,
          unitPriceMinor: 500,
          totalPriceMinor: 0,
          required: true,
        },
      ],
      optionalExtras: [
        {
          extraServiceId: "flower",
          name: "Flower",
          pricingMode: "PER_UNIT",
          quantity: 0,
          maxQuantity: 5,
          includedQuantity: 0,
          unitPriceMinor: 2000,
          totalPriceMinor: 0,
          required: false,
        },
        {
          extraServiceId: "extra-seat",
          name: "Extra Child Seat",
          pricingMode: "PER_UNIT",
          quantity: 0,
          maxQuantity: 5,
          includedQuantity: 1,
          unitPriceMinor: 500,
          totalPriceMinor: 0,
          required: false,
        },
      ],
      features: [],
      quote: {
        currency: "EUR",
        baseItems: [
          {
            type: "TRANSFER_VEHICLE",
            referenceId: "vehicle-1",
            name: "Vito",
            quantity: 1,
            unitPriceMinor: 10000,
            totalPriceMinor: 10000,
          },
        ],
        extraItems: [],
        subtotalMinor: 10000,
        totalMinor: 10000,
      },
    },
  ],
};

describe("buildOrderPricing", () => {
  it("applies includedQuantity when pricing optional extras locally", () => {
    const option = quoteFixture.options[0]!;
    const pricing = buildOrderPricing(option, quoteFixture, [
      { extraServiceId: "extra-seat", quantity: 3 },
    ]);

    expect(pricing.optionalExtras[0]?.totalPriceMinor).toBe(1000);
    expect(pricing.totalMinor).toBe(11000);
  });

  it("includes required extras already priced by the server", () => {
    const option = quoteFixture.options[0]!;
    const pricing = buildOrderPricing(option, quoteFixture, [
      { extraServiceId: "flower", quantity: 1 },
    ]);

    expect(pricing.requiredExtras[0]?.totalPriceMinor).toBe(0);
    expect(pricing.optionalExtras[0]?.totalPriceMinor).toBe(2000);
    expect(pricing.totalMinor).toBe(12000);
  });
});
