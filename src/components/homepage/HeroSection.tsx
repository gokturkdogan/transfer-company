import Image from "next/image";
import { type ReactNode } from "react";
import { getTranslations } from "next-intl/server";

import { Container } from "@/components/layout/Container";
import { HOMEPAGE_IMAGES } from "@/config/homepage-images";

type HeroSectionProps = {
  bookingForm: ReactNode;
};

export async function HeroSection({ bookingForm }: HeroSectionProps) {
  const t = await getTranslations("home.hero");

  return (
    <section className="relative">
      <div className="absolute inset-0 min-h-full">
        <Image
          src={HOMEPAGE_IMAGES.hero}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/60" />
      </div>

      <Container className="relative space-y-6 pt-24 pb-10 md:space-y-8 md:pt-28 md:pb-14">
        <div className="max-w-3xl space-y-4">
          <h1 className="text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
            {t("title")}
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg">
            {t("subtitle")}
          </p>
        </div>

        <div
          id="booking"
          className="rounded-2xl border border-white/10 bg-card p-4 shadow-2xl shadow-black/20 sm:p-5 md:p-6"
        >
          {bookingForm}
        </div>
      </Container>
    </section>
  );
}
