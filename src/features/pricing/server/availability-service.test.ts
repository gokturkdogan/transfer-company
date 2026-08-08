import { describe, expect, it } from "vitest";

import { AvailabilityService } from "@/features/pricing/server/availability-service";
import { createPricingReaderFake } from "@/test/fakes/pricing-reader";
import { addMinutes } from "@/lib/datetime";

describe("AvailabilityService", () => {
  it("returns eligible vehicle options with required luggage extras", async () => {
    const service = new AvailabilityService(createPricingReaderFake());

    const result = await service.getTransferOptions({
      originAirportId: "pickup-1",
      destinationDistrictId: "dropoff-1",
      tripType: "ONE_WAY",
      outboundAt: addMinutes(new Date(), 120),
      passengerCount: 3,
      largeLuggageCount: 8,
      cabinLuggageCount: 0,
      locale: "en",
    });

    expect(result.routeId).toBe("route-1");
    expect(result.options.length).toBeGreaterThan(0);

    const option = result.options[0]!;
    expect(option.eligibility).toBe("ELIGIBLE_WITH_EXTRAS");
    expect(option.requiredLuggageVehicles).toBeGreaterThan(0);
    expect(option.requiredExtras[0]?.required).toBe(true);
    expect(option.quote.totalMinor).toBeGreaterThan(option.quote.baseItems[0]!.totalPriceMinor);
  });

  it("includes ineligible options for cabin luggage overflow", async () => {
    const service = new AvailabilityService(createPricingReaderFake());

    const result = await service.getTransferOptions({
      originAirportId: "pickup-1",
      destinationDistrictId: "dropoff-1",
      tripType: "ONE_WAY",
      outboundAt: addMinutes(new Date(), 120),
      passengerCount: 2,
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
      largeLuggageCount: 0,
      cabinLuggageCount: 0,
      locale: "en",
    });

    expect(result.routeId).toBe("route-1");
    expect(result.options[0]?.quote.totalMinor).toBe(10_000);
  });

  it("returns the same quote for repeated airport to district searches", async () => {
    const service = new AvailabilityService(createPricingReaderFake());
    const input = {
      originAirportId: "pickup-1",
      destinationDistrictId: "dropoff-1",
      tripType: "ONE_WAY" as const,
      outboundAt: addMinutes(new Date(), 120),
      passengerCount: 2,
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
