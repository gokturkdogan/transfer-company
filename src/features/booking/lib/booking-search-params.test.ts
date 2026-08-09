import { describe, expect, it } from "vitest";

import { buildBookingSearchParams } from "@/features/booking/lib/booking-search-params";
import { getDefaultSearchState } from "@/features/booking/lib/error-messages";

describe("buildBookingSearchParams", () => {
  it("serializes one-way search params", () => {
    const params = buildBookingSearchParams({
      ...getDefaultSearchState(),
      originAirportId: "airport-1",
      cityId: "city-1",
      destinationDistrictId: "district-1",
      outboundDate: "2026-08-22",
      outboundTime: "20:00",
      passengerCount: 2,
      childCount: 1,
      largeLuggageCount: 1,
      cabinLuggageCount: 0,
    });

    expect(params.get("airport")).toBe("airport-1");
    expect(params.get("district")).toBe("district-1");
    expect(params.get("outboundDate")).toBe("2026-08-22");
    expect(params.get("passengers")).toBe("2");
    expect(params.get("children")).toBe("1");
    expect(params.get("returnDate")).toBeNull();
  });

  it("includes return fields for round trips", () => {
    const params = buildBookingSearchParams({
      ...getDefaultSearchState(),
      tripType: "ROUND_TRIP",
      returnDate: "2026-08-25",
      returnTime: "10:00",
    });

    expect(params.get("tripType")).toBe("ROUND_TRIP");
    expect(params.get("returnDate")).toBe("2026-08-25");
    expect(params.get("returnTime")).toBe("10:00");
  });

  it("includes reverse flag when direction is reversed", () => {
    const params = buildBookingSearchParams({
      ...getDefaultSearchState(),
      isReverseDirection: true,
    });

    expect(params.get("reverse")).toBe("1");
  });
});
