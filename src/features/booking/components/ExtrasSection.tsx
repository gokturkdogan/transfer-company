"use client";

import { Info, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";

import { Alert, AlertDescription } from "@/components/ui/alert";
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
  const showLuggageVehicleNotice = selectedOption.requiredLuggageVehicles > 0;
  const showChildSeatNotice = selectedOption.requiredChildSeats > 0;
  const childSeatExtra = requiredExtras.find((extra) => extra.includedQuantity > 0);
  const childSeatIncludedQuantity = childSeatExtra?.includedQuantity ?? 1;

  if (!hasExtras && !showLuggageVehicleNotice && !showChildSeatNotice) {
    return null;
  }

  return (
    <BookingCollapsibleSection
      title={t("sectionTitle")}
      icon={<Sparkles className="h-4 w-4" aria-hidden />}
      compact
      defaultOpen
    >
      {showLuggageVehicleNotice ? (
        <Alert className="mb-4 border-gold/30 bg-gold/5">
          <Info className="h-4 w-4 text-gold-deep" aria-hidden />
          <AlertDescription className="text-sm text-foreground">
            {t("luggageVehicleAutoAdded", {
              capacity: selectedOption.largeLuggageCapacity,
            })}
          </AlertDescription>
        </Alert>
      ) : null}

      {showChildSeatNotice ? (
        <Alert className="mb-4 border-gold/30 bg-gold/5">
          <Info className="h-4 w-4 text-gold-deep" aria-hidden />
          <AlertDescription className="text-sm text-foreground">
            {t("childSeatAutoAdded", {
              count: selectedOption.requiredChildSeats,
              included: childSeatIncludedQuantity,
            })}
          </AlertDescription>
        </Alert>
      ) : null}

      {hasExtras ? (
        <ul className={bookingExtrasGridClass}>
          <RequiredExtrasPanel
            embedded
            extras={requiredExtras}
            currency={state.quote.currency}
          />
          <OptionalExtrasSelector embedded />
        </ul>
      ) : null}
    </BookingCollapsibleSection>
  );
}
