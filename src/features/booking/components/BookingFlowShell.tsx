"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

import { BOOKING_IMAGES } from "@/config/booking-images";
import { BookingMobileFooter } from "@/features/booking/components/BookingMobileFooter";
import { VehicleMultiSelectFooter } from "@/features/booking/components/VehicleMultiSelectFooter";
import { BookingInlineSearchBar } from "@/features/booking/components/BookingInlineSearchBar";
import { BookingSidebar } from "@/features/booking/components/BookingSidebar";
import { BookingPageHero } from "@/features/booking/components/BookingPageHero";
import { BookingStepper } from "@/features/booking/components/BookingStepper";
import { useBookingFlow } from "@/features/booking/context/booking-flow-context";
import {
  getRequiredCapacityPassengerCount,
  requiresMultiVehicleSelection,
} from "@/features/booking/lib/vehicle-selection";
import { cn } from "@/lib/utils";

type BookingFlowShellProps = {
  children: React.ReactNode;
};

export function BookingFlowShell({ children }: BookingFlowShellProps) {
  const { state } = useBookingFlow();
  const isInitialStep = useRef(true);
  const isSuccessStep = state.step === "success";
  const showInlineSearch = !isSuccessStep;
  const showOrderSummary =
    state.step === "customer" || state.step === "review";
  const showMobileStickySummary = state.step === "customer";
  const showVehicleMultiSelectFooter =
    state.step === "vehicle" &&
    state.quote &&
    requiresMultiVehicleSelection(
      getRequiredCapacityPassengerCount(state.search),
      state.quote.options,
    );
  const isPricingContactOnly =
    state.quote?.pricingUnavailable === true ||
    (state.step === "vehicle" &&
      state.quote !== null &&
      state.quote.options.length === 0);
  const showStepper =
    state.step !== "search" &&
    !(state.step === "vehicle" && !state.quote) &&
    !isPricingContactOnly &&
    !isSuccessStep;

  useEffect(() => {
    if (isInitialStep.current) {
      isInitialStep.current = false;
      return;
    }

    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, [state.step]);

  return (
    <div
      className={cn(
        "relative",
        isSuccessStep && "isolate min-h-[100vh]",
      )}
    >
      {isSuccessStep ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
        >
          <Image
            src={BOOKING_IMAGES.success}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-[center_42%]"
          />
          <div className="absolute inset-0 bg-ink/35" />
          <div className="absolute inset-0 bg-gradient-to-b from-ink/25 via-transparent to-ink/55" />
          <div className="absolute inset-0 bg-gradient-to-r from-ink/40 via-transparent to-ink/20" />
          <div className="absolute inset-0 bg-[radial-gradient(70%_55%_at_18%_0%,rgb(200_164_93/0.12),transparent_68%)]" />
        </div>
      ) : (
        <BookingPageHero currentStep={state.step} />
      )}

      <div
        className={cn(
          "relative z-10 mx-auto w-full px-4 sm:px-6",
          showOrderSummary ? "max-w-7xl" : "max-w-6xl",
          isSuccessStep
            ? "flex min-h-[100vh] flex-col justify-center pt-32 pb-16 sm:pt-36 md:pt-44 md:pb-20"
            : cn(
                "-mt-14 md:-mt-20",
                showMobileStickySummary
                  ? "pb-[calc(5.75rem+env(safe-area-inset-bottom))] md:pb-16"
                  : showVehicleMultiSelectFooter
                    ? "pb-[calc(5.75rem+env(safe-area-inset-bottom))] lg:pb-[7.5rem]"
                    : "pb-28 md:pb-16",
              ),
        )}
      >
        {showInlineSearch && (
          <div className="relative z-10">
            <BookingInlineSearchBar />
          </div>
        )}

        {showStepper ? (
          <div className="py-8 md:py-10">
            <BookingStepper currentStep={state.step} />
          </div>
        ) : null}

        <div
          className={cn(
            "grid gap-8 lg:items-stretch",
            showOrderSummary &&
              "lg:grid-cols-[minmax(0,1fr)_minmax(17rem,20rem)] xl:grid-cols-[minmax(0,1fr)_22rem]",
          )}
        >
          <div className="min-w-0">{children}</div>

          {showOrderSummary ? (
            <aside className="relative hidden min-h-full lg:block">
              <div className="sticky top-24 z-10 w-full xl:top-28">
                <BookingSidebar />
              </div>
            </aside>
          ) : null}
        </div>
      </div>

      <VehicleMultiSelectFooter />
      <BookingMobileFooter />
    </div>
  );
}
