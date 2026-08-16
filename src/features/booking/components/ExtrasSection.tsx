"use client";

import { Info, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { BookingCollapsibleSection } from "@/features/booking/components/BookingCollapsibleSection";
import { bookingExtrasGridClass } from "@/features/booking/components/booking-form-styles";
import { OptionalExtrasSelector } from "@/features/booking/components/OptionalExtrasSelector";
import { RequiredExtrasPanel } from "@/features/booking/components/RequiredExtrasPanel";
import { useBookingFlow } from "@/features/booking/context/booking-flow-context";
import { resolveActiveVehicleContext } from "@/features/booking/lib/vehicle-selection-context";

export function ExtrasSection() {
  const t = useTranslations("booking.extras");
  const { state } = useBookingFlow();

  const { selectedOptions, requiredExtras, optionalExtras } =
    resolveActiveVehicleContext(state.quote, state.selectedVehicles);

  if (!state.quote || selectedOptions.length === 0) {
    return null;
  }

  const primaryOption = selectedOptions[0]!;
  const hasExtras = requiredExtras.length > 0 || optionalExtras.length > 0;
  const showLuggageVehicleNotice = Boolean(primaryOption.requiredLuggageVehicle);
  const luggageFleetVehicle = primaryOption.requiredLuggageVehicle;
  const showChildSeatNotice = primaryOption.requiredChildSeats > 0;
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
        <Alert className="mb-3 flex items-center gap-2 border-gold/30 bg-gold/5 px-3 py-2">
          <Info className="h-3.5 w-3.5 shrink-0 text-gold-deep" aria-hidden />
          <AlertDescription className="min-w-0 truncate text-xs leading-snug text-foreground">
            {t("luggageVehicleAutoAdded", {
              vehicle: luggageFleetVehicle?.vehicleCategoryName ?? "",
              count: luggageFleetVehicle?.quantity ?? 0,
              capacity: primaryOption.largeLuggageCapacity,
            })}
          </AlertDescription>
        </Alert>
      ) : null}

      {showChildSeatNotice ? (
        <Alert className="mb-3 flex items-center gap-2 border-gold/30 bg-gold/5 px-3 py-2">
          <Info className="h-3.5 w-3.5 shrink-0 text-gold-deep" aria-hidden />
          <AlertDescription className="min-w-0 truncate text-xs leading-snug text-foreground">
            {t("childSeatAutoAdded", {
              count: primaryOption.requiredChildSeats,
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
