"use client";

import { useTranslations } from "next-intl";

import { BookingSearchPromptIllustration } from "@/features/booking/components/BookingSearchPromptIllustration";
import { cn } from "@/lib/utils";

type BookingSearchPromptProps = {
  className?: string;
};

export function BookingSearchPrompt({ className }: BookingSearchPromptProps) {
  const t = useTranslations("booking.searchPrompt");

  return (
    <div
      className={cn(
        "relative mt-6 overflow-hidden rounded-[1.35rem] border border-border/60 bg-gradient-to-br from-card via-card to-muted/25 shadow-float md:mt-8",
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
          <h3 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
            {t("title")}
          </h3>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-[0.95rem]">
            {t("description")}
          </p>
        </div>
      </div>
    </div>
  );
}
