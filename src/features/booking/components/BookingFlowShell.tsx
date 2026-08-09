"use client";

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
  const showInlineSearch = state.step !== "success";
  const showOrderSummary =
    state.step === "customer" || state.step === "review";

  return (
    <>
      <BookingPageHero currentStep={state.step} />

      <div
        className={cn(
          "relative mx-auto w-full px-4 sm:px-6",
          showOrderSummary ? "max-w-7xl" : "max-w-6xl",
          state.step === "success" ? "py-10 md:py-14" : "-mt-14 pb-28 md:-mt-20 md:pb-16",
        )}
      >
        {showInlineSearch && (
          <div className="relative z-10">
            <BookingInlineSearchBar />
          </div>
        )}

        {state.step !== "success" && (
          <div className="py-8 md:py-10">
            <BookingStepper currentStep={state.step} />
          </div>
        )}

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
    </>
  );
}
