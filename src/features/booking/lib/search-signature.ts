import type { BookingSearchState } from "@/features/booking/lib/types";

export function joinWallClockDateTime(date: string, time: string): string {
  return `${date}T${time}`;
}

export function buildSearchSignature(search: BookingSearchState): string {
  const parts = [
    search.originAirportId,
    search.destinationDistrictId,
    search.tripType,
    search.outboundDate,
    search.outboundTime,
    search.tripType === "ROUND_TRIP" ? search.returnDate : "",
    search.tripType === "ROUND_TRIP" ? search.returnTime : "",
    String(search.passengerCount),
    String(search.largeLuggageCount),
    String(search.cabinLuggageCount),
  ];

  return parts.join("|");
}

export function buildQuoteRequest(
  search: BookingSearchState,
  locale: string,
  selection?: {
    vehicleCategoryId: string;
    quantity: number;
    extras: Array<{ extraServiceId: string; quantity: number }>;
  },
) {
  const outboundAt = joinWallClockDateTime(
    search.outboundDate,
    search.outboundTime,
  );

  const returnAt =
    search.tripType === "ROUND_TRIP" && search.returnDate && search.returnTime
      ? joinWallClockDateTime(search.returnDate, search.returnTime)
      : undefined;

  return {
    originAirportId: search.originAirportId,
    destinationDistrictId: search.destinationDistrictId,
    tripType: search.tripType,
    outboundAt,
    returnAt,
    passengerCount: search.passengerCount,
    largeLuggageCount: search.largeLuggageCount,
    cabinLuggageCount: search.cabinLuggageCount,
    locale,
    selection,
  };
}
