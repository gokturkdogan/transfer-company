import { ChevronDown, ShieldCheck, Sparkles, Star } from "lucide-react";
import Image from "next/image";
import { type ReactNode } from "react";
import { getTranslations } from "next-intl/server";

import { Container } from "@/components/layout/Container";
import { HeroBackdrop } from "@/components/homepage/HeroBackdrop";
import { HOMEPAGE_IMAGES } from "@/config/homepage-images";

type HeroSectionProps = {
  bookingForm: ReactNode;
};

export async function HeroSection({ bookingForm }: HeroSectionProps) {
  const t = await getTranslations("home.hero");

  return (
    <section className="relative isolate overflow-hidden bg-ink">
      <Image
        src={HOMEPAGE_IMAGES.hero}
        alt=""
        fill
        priority
        sizes="100vw"
        className="absolute inset-0 -z-10 scale-105 object-cover"
      />
      <HeroBackdrop />

      <Container className="relative flex min-h-[100svh] flex-col justify-center gap-6 pt-24 pb-14 md:gap-8 md:pt-28 md:pb-20">
        <div className="max-w-3xl space-y-4 md:space-y-5">
          <p className="ring-gold-hairline inline-flex animate-fade-up items-center gap-2 rounded-full bg-white/8 py-1.5 ps-3 pe-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-gold-light backdrop-blur-md sm:text-xs">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            {t("badge")}
          </p>

          <h1
            className="animate-fade-up text-[2rem] font-bold leading-[1.06] tracking-tight text-white sm:text-5xl lg:text-[3.5rem] xl:text-6xl"
            style={{ animationDelay: "80ms" }}
          >
            {t("title")}
            <span className="block text-gold-shimmer">{t("titleAccent")}</span>
          </h1>

          <p
            className="max-w-xl animate-fade-up text-sm leading-relaxed text-white/75 sm:text-base lg:max-w-2xl lg:text-lg"
            style={{ animationDelay: "160ms" }}
          >
            {t("subtitle")}
          </p>

          <div
            className="flex animate-fade-up flex-wrap items-center gap-x-5 gap-y-2"
            style={{ animationDelay: "220ms" }}
          >
            <span className="flex items-center gap-1.5 text-xs font-medium text-white/85 sm:text-sm">
              <span className="flex gap-0.5 text-gold" aria-hidden>
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} className="h-3.5 w-3.5 fill-current" />
                ))}
              </span>
              {t("rating")}
            </span>
            <span className="flex items-center gap-1.5 text-xs font-medium text-white/70 sm:text-sm">
              <ShieldCheck className="h-4 w-4 text-gold" aria-hidden />
              {t("guarantee")}
            </span>
          </div>
        </div>

        <div
          id="booking"
          className="animate-fade-up scroll-mt-24"
          style={{ animationDelay: "300ms" }}
        >
          {bookingForm}
        </div>
      </Container>

      <div className="absolute inset-x-0 bottom-5 hidden justify-center xl:flex">
        <span className="flex animate-scroll-hint flex-col items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/55">
          {t("scrollHint")}
          <ChevronDown className="h-4 w-4" aria-hidden />
        </span>
      </div>
    </section>
  );
}
