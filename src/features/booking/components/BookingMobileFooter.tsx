"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { MobileContactBar } from "@/components/shared/MobileContactBar";
import { BookingMobileStickySummary } from "@/features/booking/components/BookingMobileStickySummary";
import { useBookingFlow } from "@/features/booking/context/booking-flow-context";
import {
  getRequiredCapacityPassengerCount,
  requiresMultiVehicleSelection,
} from "@/features/booking/lib/vehicle-selection";

export function BookingMobileFooter() {
  const { state } = useBookingFlow();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || state.step === "success") {
    return null;
  }

  if (state.step === "customer") {
    return <BookingMobileStickySummary />;
  }

  if (
    state.step === "vehicle" &&
    state.quote &&
    requiresMultiVehicleSelection(
      getRequiredCapacityPassengerCount(state.search),
      state.quote.options,
    )
  ) {
    return null;
  }

  return createPortal(
    <MobileContactBar variant="booking" />,
    document.body,
  );
}
