"use client";

import { useEffect, useRef } from "react";

import { BookingFlow } from "@/features/booking/components/BookingFlow";
import { useBookingFlow } from "@/features/booking/context/booking-flow-context";
import { isLauncherSearchComplete } from "@/features/booking/lib/launcher-search";
import type { BookingSearchState } from "@/features/booking/lib/types";

export function BookingFlowWithInit({
  initialSearch,
}: {
  initialSearch?: Partial<BookingSearchState>;
}) {
  const { requestQuote } = useBookingFlow();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current || !isLauncherSearchComplete(initialSearch)) {
      return;
    }

    initialized.current = true;
    void requestQuote();
  }, [initialSearch, requestQuote]);

  return <BookingFlow />;
}
