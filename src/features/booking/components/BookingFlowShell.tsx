"use client";

import { useTranslations } from "next-intl";

import { BookingInlineSearchBar } from "@/features/booking/components/BookingInlineSearchBar";
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

  return (
    <>
      <BookingPageHero currentStep={state.step} />

      <div
        className={cn(
          "relative mx-auto w-full max-w-6xl px-4 sm:px-6",
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

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)] lg:items-start">
          <div className="min-w-0">{children}</div>

          {state.step !== "success" && state.step !== "search" && state.step !== "vehicle" && (
            <aside className="hidden lg:block">
              <BookingTrustAside />
            </aside>
          )}
        </div>
      </div>
    </>
  );
}

function BookingTrustAside() {
  const t = useTranslations("booking.page");

  return (
    <div className="sticky top-28 space-y-4 rounded-[1.25rem] border border-border/70 bg-muted/50 p-5">
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-gold">
        {t("trustTitle")}
      </p>
      <ul className="space-y-3 text-sm text-muted-foreground">
        {(["0", "1", "2"] as const).map((key) => (
          <li
            key={key}
            className="rounded-xl border border-border/60 bg-card px-3 py-2.5"
          >
            {t(`trustItems.${key}`)}
          </li>
        ))}
      </ul>
    </div>
  );
}
