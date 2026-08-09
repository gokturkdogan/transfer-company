import type { BookingSearchState } from "@/features/booking/lib/types";

export function parseBookingSearchParams(
  params: Record<string, string | string[] | undefined>,
): Partial<BookingSearchState> {
  const get = (key: string) => {
    const value = params[key];
    return typeof value === "string" ? value : "";
  };

  const tripType = get("tripType");
  const reverse = get("reverse");

  return {
    originAirportId: get("airport") || get("pickup"),
    cityId: get("city"),
    destinationDistrictId: get("district") || get("dropoff"),
    isReverseDirection: reverse === "1" || reverse === "true",
    tripType: tripType === "ROUND_TRIP" ? "ROUND_TRIP" : "ONE_WAY",
    outboundDate: get("outboundDate"),
    outboundTime: get("outboundTime") || "10:00",
    returnDate: get("returnDate"),
    returnTime: get("returnTime") || "10:00",
    passengerCount: Number(get("passengers") || "2"),
    childCount: Number(get("children") || "0"),
    largeLuggageCount: Number(get("largeLuggage") || "0"),
    cabinLuggageCount: Number(get("cabinLuggage") || "0"),
  };
}
