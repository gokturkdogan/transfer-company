import { describe, expect, it } from "vitest";

import {
  buildSearchMetaLabel,
  buildSearchRouteLabel,
} from "@/features/booking/lib/build-search-summary";
import type { BookingSearchState } from "@/features/booking/lib/types";

const baseSearch: BookingSearchState = {
  originAirportId: "a",
  cityId: "c",
  destinationDistrictId: "d",
  isReverseDirection: false,
  tripType: "ONE_WAY",
  outboundDate: "2026-08-15",
  outboundTime: "14:30",
  returnDate: "",
  returnTime: "",
  passengerCount: 2,
  childCount: 1,
  largeLuggageCount: 0,
  cabinLuggageCount: 0,
};

describe("build-search-summary", () => {
  it("builds route label", () => {
    expect(
      buildSearchRouteLabel({
        airportName: "Antalya",
        districtName: "Belek",
      }),
    ).toBe("Antalya → Belek");
  });

  it("builds reversed route label", () => {
    expect(
      buildSearchRouteLabel({
        airportName: "Antalya",
        districtName: "Belek",
        isReverseDirection: true,
      }),
    ).toBe("Belek → Antalya");
  });

  it("builds meta label with passengers and schedule", () => {
    const meta = buildSearchMetaLabel({
      search: baseSearch,
      airportName: "Antalya",
      districtName: "Belek",
      locale: "tr",
      formatPassengers: (adults, children) => `${adults} adults, ${children} children`,
    });

    expect(meta).toContain("2 adults, 1 children");
    expect(meta).toContain("15");
  });
});
