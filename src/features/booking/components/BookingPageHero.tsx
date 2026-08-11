"use client";

import Image from "next/image";

import { BOOKING_IMAGES } from "@/config/booking-images";
import type { BookingStep } from "@/features/booking/lib/types";

type BookingPageHeroProps = {
  currentStep: BookingStep;
};

export function BookingPageHero({ currentStep }: BookingPageHeroProps) {
  if (currentStep === "success") {
    return null;
  }

  return (
    <section className="relative isolate h-44 overflow-hidden bg-ink sm:h-52 md:h-60 lg:h-72">
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

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent"
      />
    </section>
  );
}
