"use client";

import { Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";

import { BookingCollapsibleSection } from "@/features/booking/components/BookingCollapsibleSection";
import { bookingExtrasGridClass } from "@/features/booking/components/booking-form-styles";
import { OptionalExtrasSelector } from "@/features/booking/components/OptionalExtrasSelector";
import { RequiredExtrasPanel } from "@/features/booking/components/RequiredExtrasPanel";
import { useBookingFlow } from "@/features/booking/context/booking-flow-context";

export function ExtrasSection() {
  const t = useTranslations("booking.extras");
  const { state } = useBookingFlow();

  const selectedOption = state.quote?.options.find(
    (option) => option.vehicleCategoryId === state.selectedVehicleCategoryId,
  );

  if (!selectedOption || !state.quote) {
    return null;
  }

  const requiredExtras = selectedOption.requiredExtras;
  const optionalExtras = selectedOption.optionalExtras;
  const hasExtras = requiredExtras.length > 0 || optionalExtras.length > 0;

  if (!hasExtras) {
    return null;
  }

  return (
    <BookingCollapsibleSection
      title={t("sectionTitle")}
      icon={<Sparkles className="h-4 w-4" aria-hidden />}
      compact
      defaultOpen
    >
      <ul className={bookingExtrasGridClass}>
        <RequiredExtrasPanel
          embedded
          extras={requiredExtras}
          currency={state.quote.currency}
        />
        <OptionalExtrasSelector embedded />
      </ul>
    </BookingCollapsibleSection>
  );
}
