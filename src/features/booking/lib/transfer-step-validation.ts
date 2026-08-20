import type { BookingFieldHighlight, BookingFlowState } from "@/features/booking/lib/types";

export function getTransferValidationIssue(
  state: Pick<BookingFlowState, "search" | "flight">,
): {
  errorKey: string;
  fieldHighlight: BookingFieldHighlight;
} | null {
  if (state.search.tripType !== "ROUND_TRIP") {
    return null;
  }

  if (!state.search.returnDate || !state.search.returnTime) {
    return {
      errorKey: "errors.schedule",
      fieldHighlight: "transfer.returnSchedule",
    };
  }

  if (!state.flight.returnFlightNumber.trim()) {
    return {
      errorKey: "errors.returnFlightNumber",
      fieldHighlight: "transfer.returnFlightNumber",
    };
  }

  return null;
}
