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
        src={BOOKING_IMAGES.heroAccent}
        alt=""
        fill
        priority
        sizes="100vw"
        className="absolute inset-0 -z-10 object-cover opacity-55"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ink/75 via-ink/65 to-ink/90"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_55%_at_18%_0%,rgb(200_164_93/0.22),transparent_68%)]"
      />

      <div className="mx-auto max-w-6xl px-4 pb-24 pt-24 sm:px-6 md:pb-32 md:pt-28">
        <p className="ring-gold-hairline mb-3 inline-flex w-fit items-center rounded-full bg-white/10 px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-gold-light backdrop-blur-md">
          {t("badge")}
        </p>
        <h1 className="max-w-2xl text-2xl font-bold leading-tight tracking-tight text-white sm:text-3xl md:text-4xl">
          {t("title")}
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/70 sm:text-base">
          {t("subtitle")}
        </p>
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent"
      />
    </section>
  );
}
