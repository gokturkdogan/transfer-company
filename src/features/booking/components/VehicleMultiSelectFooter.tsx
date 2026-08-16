"use client";

import { ArrowRight, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { createPortal } from "react-dom";

import { Button } from "@/components/ui/button";
import { useBookingFlow } from "@/features/booking/context/booking-flow-context";
import { formatPrice } from "@/features/booking/lib/format-price";
import {
  getRequiredCapacityPassengerCount,
  hasSufficientPassengerCapacity,
  requiresMultiVehicleSelection,
  sumSelectedPassengerCapacity,
} from "@/features/booking/lib/vehicle-selection";
import { cn } from "@/lib/utils";

export function VehicleMultiSelectFooter() {
  const t = useTranslations("booking.vehicle");
  const locale = useLocale();
  const { state, confirmVehicleSelection } = useBookingFlow();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || state.step !== "vehicle" || !state.quote) {
    return null;
  }

  const requiredPassengers = getRequiredCapacityPassengerCount(state.search);
  const multiSelectMode = requiresMultiVehicleSelection(
    requiredPassengers,
    state.quote.options,
  );

  if (!multiSelectMode) {
    return null;
  }

  const coveredPassengers = sumSelectedPassengerCapacity(
    state.selectedVehicles,
    state.quote.options,
  );
  const canContinue =
    state.selectedVehicles.length > 0 &&
    hasSufficientPassengerCapacity(
      state.selectedVehicles,
      state.quote.options,
      requiredPassengers,
    );

  const estimatedTotalMinor = state.selectedVehicles.reduce((sum, selection) => {
    const option = state.quote!.options.find(
      (item) => item.vehicleCategoryId === selection.vehicleCategoryId,
    );

    if (!option) {
      return sum;
    }

    return sum + option.quote.totalMinor * selection.quantity;
  }, 0);

  return createPortal(
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-[60] border-t border-white/10",
        state.isLoadingQuote && "opacity-80",
      )}
    >
      <div
        className={cn(
          "relative bg-gradient-to-br from-ink-elevated via-ink-soft to-ink",
          "px-4 pt-3 shadow-[0_-16px_48px_rgb(0_0_0/0.42)] backdrop-blur-xl",
          "pb-[max(0.75rem,env(safe-area-inset-bottom))]",
          "sm:px-6 sm:py-4",
        )}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_120%_at_100%_100%,rgb(200_164_93/0.12),transparent_55%)]"
        />

        <div
          className={cn(
            "relative z-[1] mx-auto flex max-w-7xl items-center gap-3",
            "sm:justify-between sm:gap-6",
          )}
        >
          <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/8 text-gold sm:h-11 sm:w-11">
              <Users className="h-5 w-5" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-medium text-white sm:text-sm">
                {t("multiSelectHint")}
              </p>
              <p className="mt-0.5 text-xs text-white/60 sm:text-sm">
                {t("capacityProgress", {
                  covered: coveredPassengers,
                  required: requiredPassengers,
                })}
                {estimatedTotalMinor > 0 ? (
                  <>
                    {" · "}
                    <span className="font-semibold text-gold-light">
                      {formatPrice(
                        estimatedTotalMinor,
                        state.quote.currency,
                        locale,
                      )}
                    </span>
                  </>
                ) : null}
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="gold"
            size="lg"
            disabled={!canContinue || state.isLoadingQuote}
            className="h-11 shrink-0 cursor-pointer gap-2 px-4 text-xs font-bold uppercase tracking-[0.1em] disabled:cursor-not-allowed sm:px-8 sm:text-sm"
            onClick={() => void confirmVehicleSelection()}
          >
            {t("continueSelection")}
            <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
