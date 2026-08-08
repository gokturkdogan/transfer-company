import { describe, expect, it } from "vitest";

import { calculateQuote } from "./calculate-quote";
import { PricingDomainError } from "./errors";
import type { TransferQuoteInput } from "../types";

const vitoVehicle = {
  vehicleCategoryId: "vito-id",
  vehicleCategoryName: "Ultra VIP Vito",
  quantity: 1,
  oneWayPriceMinor: 4500,
  roundTripPriceMinor: 8500,
};

const sprinterVehicle = {
  vehicleCategoryId: "sprinter-id",
  vehicleCategoryName: "Ultra VIP Sprinter",
  quantity: 1,
  oneWayPriceMinor: 6500,
  roundTripPriceMinor: 12000,
};

describe("calculateQuote", () => {
  it("calculates one-way price", () => {
    const result = calculateQuote({
      tripType: "ONE_WAY",
      currency: "EUR",
      vehicles: [vitoVehicle],
      extras: [],
    });

    expect(result.quote.subtotalMinor).toBe(4500);
    expect(result.quote.totalMinor).toBe(4500);
    expect(result.quote.baseItems[0]?.totalPriceMinor).toBe(4500);
  });

  it("calculates round-trip price", () => {
    const result = calculateQuote({
      tripType: "ROUND_TRIP",
      currency: "EUR",
      vehicles: [vitoVehicle],
      extras: [],
    });

    expect(result.quote.subtotalMinor).toBe(8500);
    expect(result.quote.totalMinor).toBe(8500);
  });

  it("uses different price per vehicle category", () => {
    const vitoQuote = calculateQuote({
      tripType: "ONE_WAY",
      currency: "EUR",
      vehicles: [vitoVehicle],
      extras: [],
    });

    const sprinterQuote = calculateQuote({
      tripType: "ONE_WAY",
      currency: "EUR",
      vehicles: [sprinterVehicle],
      extras: [],
    });

    expect(vitoQuote.quote.totalMinor).toBe(4500);
    expect(sprinterQuote.quote.totalMinor).toBe(6500);
  });

  it("calculates fixed extra service", () => {
    const result = calculateQuote({
      tripType: "ONE_WAY",
      currency: "EUR",
      vehicles: [vitoVehicle],
      extras: [
        {
          extraServiceId: "meet-greet",
          extraServiceName: "VIP Meet and Greet",
          pricingMode: "FIXED",
          quantity: 3,
          unitPriceMinor: 2500,
          currency: "EUR",
        },
      ],
    });

    expect(result.quote.extraItems[0]?.quantity).toBe(1);
    expect(result.quote.extraItems[0]?.totalPriceMinor).toBe(2500);
    expect(result.quote.totalMinor).toBe(7000);
  });

  it("calculates per-unit extra service", () => {
    const result = calculateQuote({
      tripType: "ONE_WAY",
      currency: "EUR",
      vehicles: [vitoVehicle],
      extras: [
        {
          extraServiceId: "baby-seat",
          extraServiceName: "Baby Seat",
          pricingMode: "PER_UNIT",
          quantity: 2,
          unitPriceMinor: 1000,
          currency: "EUR",
        },
      ],
    });

    expect(result.quote.extraItems[0]?.totalPriceMinor).toBe(2000);
    expect(result.quote.totalMinor).toBe(6500);
  });

  it("rejects currency mismatch", () => {
    const input: TransferQuoteInput = {
      tripType: "ONE_WAY",
      currency: "EUR",
      vehicles: [vitoVehicle],
      extras: [
        {
          extraServiceId: "baby-seat",
          extraServiceName: "Baby Seat",
          pricingMode: "PER_UNIT",
          quantity: 1,
          unitPriceMinor: 1000,
          currency: "USD",
        },
      ],
    };

    expect(() => calculateQuote(input)).toThrow(PricingDomainError);
  });

  it("rejects round trip when price is unavailable", () => {
    const input: TransferQuoteInput = {
      tripType: "ROUND_TRIP",
      currency: "EUR",
      vehicles: [
        {
          ...vitoVehicle,
          roundTripPriceMinor: null,
        },
      ],
      extras: [],
    };

    expect(() => calculateQuote(input)).toThrow(PricingDomainError);
  });
});
