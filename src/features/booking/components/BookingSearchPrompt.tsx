"use client";

import { CalendarDays, MapPinned, Search } from "lucide-react";
import { useTranslations } from "next-intl";

import { BookingSearchPromptIllustration } from "@/features/booking/components/BookingSearchPromptIllustration";
import { cn } from "@/lib/utils";

const PROMPT_STEPS = [
  { key: "stepRoute", icon: MapPinned },
  { key: "stepSchedule", icon: CalendarDays },
  { key: "stepSearch", icon: Search },
] as const;

type BookingSearchPromptProps = {
  className?: string;
};

export function BookingSearchPrompt({ className }: BookingSearchPromptProps) {
  const t = useTranslations("booking.searchPrompt");

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[1.35rem] border border-border/60 bg-gradient-to-br from-card via-card to-muted/25 shadow-float",
        className,
      )}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_80%_at_50%_0%,rgb(200_164_93/0.12),transparent_65%)]"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -end-10 -top-10 h-40 w-40 rounded-full bg-gold/10 blur-3xl"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -bottom-12 -start-8 h-36 w-36 rounded-full bg-gold/8 blur-3xl"
      />

      <div className="relative px-6 py-8 text-center sm:px-10 sm:py-10">
        <BookingSearchPromptIllustration className="mx-auto h-36 w-auto sm:h-40" />

        <div className="mx-auto mt-6 max-w-md space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-gold-deep">
            {t("eyebrow")}
          </p>
          <h3 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
            {t("title")}
          </h3>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-[0.95rem]">
            {t("description")}
          </p>
        </div>

        <ol className="mx-auto mt-7 grid max-w-lg gap-2.5 text-start sm:grid-cols-3 sm:gap-3">
          {PROMPT_STEPS.map((step, index) => {
            const Icon = step.icon;

            return (
              <li
                key={step.key}
                className="flex items-start gap-3 rounded-xl border border-border/50 bg-background/70 px-3.5 py-3 backdrop-blur-sm"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gold/14 text-gold-deep">
                  <Icon className="h-4 w-4" aria-hidden />
                </span>
                <span className="min-w-0 pt-0.5">
                  <span className="block text-[10px] font-bold uppercase tracking-[0.14em] text-gold-deep/80">
                    {t("stepLabel", { step: index + 1 })}
                  </span>
                  <span className="mt-0.5 block text-xs font-medium leading-snug text-foreground">
                    {t(step.key)}
                  </span>
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
