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

import {
  BOOKING_PROGRESS_STEPS,
  getBookingProgressIndex,
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
  const progressStep = resolveBookingProgressStep(currentStep);

  if (!progressStep) {
    return null;
  }

  const currentIndex = getBookingProgressIndex(progressStep);
  const filledRatio = currentIndex / (BOOKING_PROGRESS_STEPS.length - 1);

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

            return (
              <li
                key={step}
                className="flex flex-col items-center gap-3 text-center"
                aria-current={active ? "step" : undefined}
              >
                <Icon
                  className={cn(
                    "h-6 w-6 shrink-0 transition-colors duration-300 sm:h-7 sm:w-7",
                    active && "text-gold",
                    completed && !active && "text-foreground",
                    !active && !completed && "text-muted-foreground/40",
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
                      !active && !completed && "h-6 w-6 border-border bg-background",
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
                  )}
                >
                  {t(step)}
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}
