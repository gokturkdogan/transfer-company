import type { BookingSearchState } from "@/features/booking/lib/types";

/** True when homepage hero search passed enough params to skip the booking search step. */
export function isLauncherSearchComplete(
  search: Partial<BookingSearchState> | undefined,
): boolean {
  if (!search) {
    return false;
  }

  const hasRoundTripFields =
    search.tripType !== "ROUND_TRIP" ||
    Boolean(search.returnDate && search.returnTime);

  return Boolean(
    search.originAirportId &&
      search.destinationDistrictId &&
      search.outboundDate &&
      search.outboundTime &&
      hasRoundTripFields,
  );
}
