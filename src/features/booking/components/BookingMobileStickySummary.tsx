"use client";

import { ArrowRight, Car, ChevronUp, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { Button } from "@/components/ui/button";
import { BookingOrderSummary } from "@/features/booking/components/BookingOrderSummary";
import { useBookingFlow } from "@/features/booking/context/booking-flow-context";
import { formatPrice } from "@/features/booking/lib/format-price";
import { arePassengerDetailsValid } from "@/features/booking/lib/passenger-details";
import { cn } from "@/lib/utils";

export function BookingMobileStickySummary() {
  const tActions = useTranslations("booking.actions");
  const tSummary = useTranslations("booking.summary");
  const locale = useLocale();
  const { state, dispatch } = useBookingFlow();
  const [mounted, setMounted] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setExpanded(false);
  }, [state.step]);

  useEffect(() => {
    if (!expanded) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setExpanded(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [expanded]);

  const selectedOption = state.quote?.options.find(
    (option) => option.vehicleCategoryId === state.selectedVehicleCategoryId,
  );

  if (
    !mounted ||
    state.step !== "customer" ||
    !state.quote ||
    !selectedOption
  ) {
    return null;
  }

  const totalMinor =
    state.quote.selection?.quote.totalMinor ?? selectedOption.quote.totalMinor;
  const canContinue =
    arePassengerDetailsValid(state.passengers) && !state.isLoadingQuote;

  const handleContinue = () => {
    dispatch({
      type: "SET_STEP",
      step: "review",
      idempotencyKey: crypto.randomUUID(),
    });
  };

  return createPortal(
    <>
      <button
        type="button"
        aria-label={tSummary("mobileSummaryCollapse")}
        tabIndex={expanded ? 0 : -1}
        aria-hidden={!expanded}
        onClick={() => setExpanded(false)}
        className={cn(
          "fixed inset-0 z-[58] cursor-pointer bg-black/45 backdrop-blur-[2px] md:hidden",
          "transition-opacity duration-300 ease-out",
          expanded ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      <div
        className={cn(
          "fixed inset-x-0 bottom-0 z-[60] md:hidden",
          state.isLoadingQuote && "opacity-80",
        )}
      >
        <button
          type="button"
          aria-label={tSummary("mobileSummaryCollapse")}
          tabIndex={expanded ? 0 : -1}
          onClick={() => setExpanded(false)}
          className={cn(
            "absolute end-3 top-3 z-[2] flex h-9 w-9 cursor-pointer items-center justify-center",
            "rounded-full border border-white/15 bg-ink/70 text-white backdrop-blur-md",
            "transition-[opacity,background-color] duration-300 ease-out hover:bg-ink/85",
            expanded ? "opacity-100 delay-150" : "pointer-events-none opacity-0",
          )}
        >
          <X className="h-4 w-4" aria-hidden />
        </button>

        <div
          className={cn(
            "overflow-hidden",
            expanded ? "pointer-events-auto" : "pointer-events-none",
          )}
        >
          <div
            className={cn(
              "max-h-[calc(100dvh-4.75rem)] overflow-y-auto overscroll-contain",
              "rounded-t-[1.5rem] border border-b-0 border-white/10 bg-card",
              "shadow-[0_-20px_56px_rgb(0_0_0/0.28)]",
              "transition-transform duration-300 ease-out will-change-transform",
              expanded ? "translate-y-0" : "translate-y-full",
            )}
          >
            <BookingOrderSummary embedded compact />
          </div>
        </div>

        <div
          className={cn(
            "relative border-t border-white/10 bg-gradient-to-br from-ink-elevated via-ink-soft to-ink",
            "px-3 pt-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))]",
            "shadow-[0_-16px_48px_rgb(0_0_0/0.42)] backdrop-blur-xl",
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

          <div className="relative z-[1] mx-auto flex max-w-3xl items-center gap-3">
            <button
              type="button"
              aria-expanded={expanded}
              onClick={() => setExpanded((open) => !open)}
              className="flex min-w-0 flex-1 cursor-pointer items-center gap-2.5 text-start"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/8 text-gold">
                <Car className="h-4 w-4" aria-hidden />
              </span>

              <span className="min-w-0 flex-1">
                <span className="flex items-baseline gap-1.5 text-sm">
                  <span className="font-bold text-gold-light">
                    {formatPrice(totalMinor, state.quote.currency, locale)}
                  </span>
                  <span className="truncate text-[11px] text-white/50">
                    {selectedOption.name}
                  </span>
                </span>
                <span className="mt-0.5 inline-flex items-center gap-1 rounded-full border border-gold/25 bg-gold/10 px-1.5 py-0.5 text-[10px] font-semibold text-gold-light">
                  <ChevronUp
                    className={cn(
                      "h-3 w-3 transition-transform duration-300",
                      expanded && "rotate-180",
                    )}
                    aria-hidden
                  />
                  {expanded
                    ? tSummary("mobileSummaryCollapse")
                    : tSummary("mobileSummaryExpand")}
                </span>
              </span>
            </button>

            <Button
              type="button"
              variant="gold"
              disabled={!canContinue}
              className="h-11 shrink-0 gap-1.5 px-4 text-xs font-bold uppercase tracking-[0.1em]"
              onClick={handleContinue}
            >
              {tActions("continue")}
              <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" aria-hidden />
            </Button>
          </div>
        </div>
      </div>
    </>,
    document.body,
  );
}
