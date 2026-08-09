"use client";

import { useEffect, useRef } from "react";

import { BookingMobileFooter } from "@/features/booking/components/BookingMobileFooter";
import { BookingInlineSearchBar } from "@/features/booking/components/BookingInlineSearchBar";
import { BookingSidebar } from "@/features/booking/components/BookingSidebar";
import { BookingPageHero } from "@/features/booking/components/BookingPageHero";
import { BookingStepper } from "@/features/booking/components/BookingStepper";
import { useBookingFlow } from "@/features/booking/context/booking-flow-context";
import { cn } from "@/lib/utils";

type BookingFlowShellProps = {
  children: React.ReactNode;
};

export function BookingFlowShell({ children }: BookingFlowShellProps) {
  const { state } = useBookingFlow();
  const isInitialStep = useRef(true);
  const showInlineSearch = state.step !== "success";
  const showOrderSummary =
    state.step === "customer" || state.step === "review";
  const showMobileStickySummary = state.step === "customer";
  const showStepper =
    state.step !== "search" &&
    !(state.step === "vehicle" && !state.quote);

  useEffect(() => {
    if (isInitialStep.current) {
      isInitialStep.current = false;
      return;
    }

    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, [state.step]);

  return (
    <>
      <BookingPageHero currentStep={state.step} />

      <div
        className={cn(
          "relative mx-auto w-full px-4 sm:px-6",
          showOrderSummary ? "max-w-7xl" : "max-w-6xl",
          state.step === "success"
            ? "py-10 md:py-14"
            : cn(
                "-mt-14 md:-mt-20",
                showMobileStickySummary
                  ? "pb-[calc(5.75rem+env(safe-area-inset-bottom))] md:pb-16"
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

      <BookingMobileFooter />
    </>
  );
}
