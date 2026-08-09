import { formatDateTimeLabel } from "@/features/booking/lib/search-datetime";
import type { BookingSearchState } from "@/features/booking/lib/types";

type SearchSummaryInput = {
  search: BookingSearchState;
  airportName: string;
  districtName: string;
  locale: string;
};

export function buildSearchRouteLabel({
  airportName,
  districtName,
}: Pick<SearchSummaryInput, "airportName" | "districtName">): string {
  const origin = airportName || "—";
  const destination = districtName || "—";

  return `${origin} → ${destination}`;
}

export function buildSearchMetaLabel({
  search,
  locale,
  formatPassengers,
}: SearchSummaryInput & {
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
