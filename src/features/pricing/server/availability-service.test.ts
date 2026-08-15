import { describe, expect, it } from "vitest";

import { AvailabilityService } from "@/features/pricing/server/availability-service";
import { createPricingReaderFake } from "@/test/fakes/pricing-reader";
import { addMinutes } from "@/lib/datetime";

describe("AvailabilityService", () => {
  it("returns eligible vehicle options with required luggage fleet vehicles", async () => {
    const service = new AvailabilityService(createPricingReaderFake());

    const result = await service.getTransferOptions({
      originAirportId: "pickup-1",
      destinationDistrictId: "dropoff-1",
      tripType: "ONE_WAY",
      outboundAt: addMinutes(new Date(), 120),
      passengerCount: 3,
      infantCount: 0,
      largeLuggageCount: 8,
      cabinLuggageCount: 0,
      locale: "en",
    });

    expect(result.routeId).toBe("route-1");
    expect(result.options.length).toBeGreaterThan(0);

    const option = result.options[0]!;
    expect(option.eligibility).toBe("ELIGIBLE_WITH_EXTRAS");
    expect(option.requiredLuggageVehicles).toBeGreaterThan(0);
    expect(option.requiredLuggageVehicle).not.toBeNull();
    expect(option.requiredExtras.every((extra) => extra.extraServiceId !== "luggage-extra-1")).toBe(
      true,
    );
    expect(option.quote.baseItems.length).toBe(2);
    expect(option.quote.totalMinor).toBeGreaterThan(
      option.quote.baseItems[0]!.totalPriceMinor,
    );
  });

  it("includes ineligible options for cabin luggage overflow", async () => {
    const service = new AvailabilityService(createPricingReaderFake());

    const result = await service.getTransferOptions({
      originAirportId: "pickup-1",
      destinationDistrictId: "dropoff-1",
      tripType: "ONE_WAY",
      outboundAt: addMinutes(new Date(), 120),
      passengerCount: 2,
      infantCount: 0,
      largeLuggageCount: 0,
      cabinLuggageCount: 20,
      locale: "en",
    });

    expect(result.options.some((option) => option.eligibility === "INELIGIBLE")).toBe(
      true,
    );
  });

  it("quotes airport to district routes", async () => {
    const service = new AvailabilityService(createPricingReaderFake());

    const result = await service.getTransferOptions({
      originAirportId: "pickup-1",
      destinationDistrictId: "dropoff-1",
      tripType: "ONE_WAY",
      outboundAt: addMinutes(new Date(), 120),
      passengerCount: 2,
      infantCount: 0,
      largeLuggageCount: 0,
      cabinLuggageCount: 0,
      locale: "en",
    });

    expect(result.routeId).toBe("route-1");
    expect(result.options[0]?.quote.totalMinor).toBe(10_000);
  });

  it("adds required child seats for infants", async () => {
    const service = new AvailabilityService(createPricingReaderFake());

    const result = await service.getTransferOptions({
      originAirportId: "pickup-1",
      destinationDistrictId: "dropoff-1",
      tripType: "ONE_WAY",
      outboundAt: addMinutes(new Date(), 120),
      passengerCount: 2,
      infantCount: 2,
      largeLuggageCount: 0,
      cabinLuggageCount: 0,
      locale: "en",
    });

    const option = result.options[0]!;
    expect(option.requiredChildSeats).toBe(2);
    expect(option.requiredExtras.some((extra) => extra.quantity === 2)).toBe(
      true,
    );
    expect(
      option.optionalExtras.every((extra) => extra.extraServiceId !== "child-seat-1"),
    ).toBe(true);
  });

  it("returns the same quote for repeated airport to district searches", async () => {
    const service = new AvailabilityService(createPricingReaderFake());
    const input = {
      originAirportId: "pickup-1",
      destinationDistrictId: "dropoff-1",
      tripType: "ONE_WAY" as const,
      outboundAt: addMinutes(new Date(), 120),
      passengerCount: 2,
      infantCount: 0,
      largeLuggageCount: 0,
      cabinLuggageCount: 0,
      locale: "en",
    };

    const first = await service.getTransferOptions(input);
    const second = await service.getTransferOptions(input);

    expect(first.options[0]?.quote.totalMinor).toBe(
      second.options[0]?.quote.totalMinor,
    );
  });
});
