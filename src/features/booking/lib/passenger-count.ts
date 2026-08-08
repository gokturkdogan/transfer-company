import type { BookingSearchState } from "@/features/booking/lib/types";

export function getTotalPassengerCount(
  search: Pick<BookingSearchState, "passengerCount" | "childCount">,
): number {
  return search.passengerCount + search.childCount;
}
