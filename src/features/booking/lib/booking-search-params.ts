import type { BookingSearchState } from "@/features/booking/lib/types";

export function buildBookingSearchParams(
  search: BookingSearchState,
): URLSearchParams {
  const params = new URLSearchParams({
    airport: search.originAirportId,
    city: search.cityId,
    district: search.destinationDistrictId,
    tripType: search.tripType,
    outboundDate: search.outboundDate,
    outboundTime: search.outboundTime,
    passengers: String(search.passengerCount),
    children: String(search.childCount),
    largeLuggage: String(search.largeLuggageCount),
  });

  if (search.tripType === "ROUND_TRIP") {
    params.set("returnDate", search.returnDate);
    params.set("returnTime", search.returnTime);
  }

  if (search.isReverseDirection) {
    params.set("reverse", "1");
  }

  return params;
}
