"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { MobileContactBar } from "@/components/shared/MobileContactBar";
import { BookingMobileStickySummary } from "@/features/booking/components/BookingMobileStickySummary";
import { useBookingFlow } from "@/features/booking/context/booking-flow-context";

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

  return createPortal(
    <MobileContactBar variant="booking" />,
    document.body,
  );
}
