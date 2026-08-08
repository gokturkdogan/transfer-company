"use client";

import { useTranslations } from "next-intl";

import type { BookingStep } from "@/features/booking/lib/types";
import { cn } from "@/lib/utils";

const STEPS: BookingStep[] = [
  "search",
  "vehicle",
  "extras",
  "customer",
  "review",
  "success",
];

export function BookingStepper({ currentStep }: { currentStep: BookingStep }) {
  const t = useTranslations("booking.steps");

  return (
    <ol className="mb-8 flex flex-wrap gap-2">
      {STEPS.filter((step) => step !== "success").map((step, index) => {
        const active = step === currentStep;
        const completed = STEPS.indexOf(currentStep) > index;

        return (
          <li
            key={step}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium",
              active && "border-primary bg-primary text-primary-foreground",
              completed && !active && "border-border bg-muted",
              !active && !completed && "border-border text-muted-foreground",
            )}
          >
            {t(step)}
          </li>
        );
      })}
    </ol>
  );
}
