"use client";

import { useEffect, useRef } from "react";

import { BookingFlow } from "@/features/booking/components/BookingFlow";
import { useBookingFlow } from "@/features/booking/context/booking-flow-context";
import type { BookingSearchState } from "@/features/booking/lib/types";

export function BookingFlowWithInit({
  initialSearch,
}: {
  initialSearch?: Partial<BookingSearchState>;
}) {
  const { requestQuote } = useBookingFlow();
  const initialized = useRef(false);

  useEffect(() => {
    if (
      initialized.current ||
      !initialSearch?.originAirportId ||
      !initialSearch.destinationDistrictId
    ) {
      return;
    }

    initialized.current = true;
    void requestQuote();
  }, [initialSearch, requestQuote]);

  return <BookingFlow />;
}
