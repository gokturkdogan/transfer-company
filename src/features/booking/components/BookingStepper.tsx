"use client";

import {
  Car,
  Check,
  ClipboardList,
  FileCheck,
  Search,
  type LucideIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { useBookingFlow } from "@/features/booking/context/booking-flow-context";
import {
  BOOKING_PROGRESS_STEPS,
  canNavigateToBookingProgressStep,
  getBookingProgressIndex,
  mapProgressStepToBookingStep,
  resolveBookingProgressStep,
  type BookingProgressStep,
} from "@/features/booking/lib/booking-progress-steps";
import type { BookingStep } from "@/features/booking/lib/types";
import { cn } from "@/lib/utils";

const STEP_ICONS: Record<BookingProgressStep, LucideIcon> = {
  search: Search,
  vehicle: Car,
  customer: ClipboardList,
  review: FileCheck,
};

const TRACK_INSET = 100 / BOOKING_PROGRESS_STEPS.length / 2;

export function BookingStepper({ currentStep }: { currentStep: BookingStep }) {
  const t = useTranslations("booking.steps");
  const { state, dispatch } = useBookingFlow();
  const progressStep = resolveBookingProgressStep(currentStep);

  if (!progressStep) {
    return null;
  }

  const currentIndex = getBookingProgressIndex(progressStep);
  const filledRatio = currentIndex / (BOOKING_PROGRESS_STEPS.length - 1);

  const handleStepClick = (step: BookingProgressStep) => {
    if (!canNavigateToBookingProgressStep(state, step)) {
      return;
    }

    const bookingStep = mapProgressStepToBookingStep(step);

    if (bookingStep === progressStep) {
      return;
    }

    dispatch({
      type: "SET_STEP",
      step: bookingStep,
      idempotencyKey:
        bookingStep === "review"
          ? (state.idempotencyKey ?? crypto.randomUUID())
          : undefined,
    });
  };

  return (
    <nav aria-label={t("progressLabel")}>
      <div className="relative">
        <div
          aria-hidden
          className="absolute top-[3.4rem] h-[3px] rounded-full bg-border"
          style={{
            insetInlineStart: `${TRACK_INSET}%`,
            insetInlineEnd: `${TRACK_INSET}%`,
          }}
        />
        <div
          aria-hidden
          className="absolute top-[3.4rem] h-[3px] rounded-full bg-gold-gradient transition-[width] duration-500 ease-out"
          style={{
            insetInlineStart: `${TRACK_INSET}%`,
            width: `${(100 - TRACK_INSET * 2) * filledRatio}%`,
          }}
        />

        <ol
          className="relative grid"
          style={{
            gridTemplateColumns: `repeat(${BOOKING_PROGRESS_STEPS.length}, minmax(0, 1fr))`,
          }}
        >
          {BOOKING_PROGRESS_STEPS.map((step, index) => {
            const Icon = STEP_ICONS[step];
            const active = index === currentIndex;
            const completed = index < currentIndex;
            const clickable = canNavigateToBookingProgressStep(state, step);

            return (
              <li key={step} className="flex flex-col items-center gap-3 text-center">
                <button
                  type="button"
                  aria-current={active ? "step" : undefined}
                  disabled={!clickable}
                  onClick={() => handleStepClick(step)}
                  className={cn(
                    "group/step flex w-full flex-col items-center gap-3 rounded-xl text-center transition-colors",
                    clickable
                      ? "cursor-pointer hover:bg-muted/40"
                      : "cursor-not-allowed",
                    active && clickable && "hover:bg-gold/5",
                  )}
                >
                  <Icon
                    className={cn(
                      "h-6 w-6 shrink-0 transition-colors duration-300 sm:h-7 sm:w-7",
                      active && "text-gold",
                      completed && !active && "text-foreground",
                      !active && !completed && "text-muted-foreground/40",
                      clickable &&
                        !active &&
                        "group-hover/step:text-foreground/80",
                    )}
                    aria-hidden
                  />

                  <span className="flex h-7 items-center justify-center">
                    <span
                      className={cn(
                        "flex items-center justify-center rounded-full border-2 transition-all duration-300",
                        active &&
                          "h-7 w-7 border-gold bg-gold-gradient text-[11px] font-bold text-ink shadow-[0_0_0_5px_rgb(200_164_93/0.16)]",
                        completed &&
                          !active &&
                          "h-6 w-6 border-gold-deep bg-gold-deep text-white",
                        !active &&
                          !completed &&
                          "h-6 w-6 border-border bg-background",
                        clickable &&
                          !active &&
                          "group-hover/step:border-gold/45",
                      )}
                    >
                      {completed && !active ? (
                        <Check className="h-3 w-3" strokeWidth={3.5} aria-hidden />
                      ) : active ? (
                        index + 1
                      ) : null}
                    </span>
                  </span>

                  <span
                    className={cn(
                      "max-w-[7.5rem] text-[11px] font-semibold leading-tight tracking-wide transition-colors duration-300 sm:text-[13px]",
                      active && "text-gold-deep",
                      completed && !active && "text-foreground",
                      !active && !completed && "text-muted-foreground/60",
                      clickable &&
                        !active &&
                        "group-hover/step:text-foreground",
                    )}
                  >
                    {t(step)}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}
