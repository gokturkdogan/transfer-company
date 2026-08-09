import { formatDateTimeLabel } from "@/features/booking/lib/search-datetime";
import { buildSearchRouteLabel } from "@/features/booking/lib/route-direction";
import type { BookingSearchState } from "@/features/booking/lib/types";

export { buildSearchRouteLabel };

export function buildSearchMetaLabel({
  search,
  locale,
  formatPassengers,
}: {
  search: BookingSearchState;
  airportName: string;
  districtName: string;
  locale: string;
  formatPassengers: (adults: number, children: number) => string;
}): string {
  const parts: string[] = [];

  if (search.outboundDate && search.outboundTime) {
    parts.push(
      formatDateTimeLabel(search.outboundDate, search.outboundTime, locale),
    );
  }

  parts.push(formatPassengers(search.passengerCount, search.childCount));

  if (search.tripType === "ROUND_TRIP" && search.returnDate && search.returnTime) {
    parts.push(
      formatDateTimeLabel(search.returnDate, search.returnTime, locale),
    );
  }

  return parts.join(" · ");
}
