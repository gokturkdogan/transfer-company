"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";

import { BOOKING_IMAGES } from "@/config/booking-images";
import type { BookingStep } from "@/features/booking/lib/types";

type BookingPageHeroProps = {
  currentStep: BookingStep;
};

export function BookingPageHero({ currentStep }: BookingPageHeroProps) {
  const t = useTranslations("booking.page");

  if (currentStep === "success") {
    return null;
  }

  return (
    <section className="relative isolate overflow-hidden bg-ink">
      <Image
        src={BOOKING_IMAGES.hero}
        alt=""
        fill
        priority
        sizes="100vw"
        className="absolute inset-0 -z-10 object-cover object-[center_42%] opacity-90"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ink/55 via-ink/45 to-ink/88"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-ink/80 via-ink/25 to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_55%_at_18%_0%,rgb(200_164_93/0.18),transparent_68%)]"
      />

      <div className="relative mx-auto max-w-6xl px-4 pb-24 pt-24 sm:px-6 md:pb-32 md:pt-28">
        <div className="relative max-w-2xl">
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-x-4 -inset-y-3 rounded-2xl bg-ink/45 backdrop-blur-[2px] sm:-inset-x-6"
          />
          <div className="relative space-y-3">
            <p className="ring-gold-hairline inline-flex w-fit items-center rounded-full border border-gold/35 bg-ink/60 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-gold backdrop-blur-md">
              {t("badge")}
            </p>
            <h1 className="text-2xl font-bold leading-tight tracking-tight text-white drop-shadow-[0_2px_14px_rgba(0,0,0,0.75)] sm:text-3xl md:text-4xl">
              {t("title")}
            </h1>
            <p className="max-w-xl text-sm leading-relaxed text-white/95 drop-shadow-[0_1px_10px_rgba(0,0,0,0.65)] sm:text-base">
              {t("subtitle")}
            </p>
          </div>
        </div>
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent"
      />
    </section>
  );
}
