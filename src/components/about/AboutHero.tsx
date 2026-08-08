import { ShieldCheck, Sparkles, Star } from "lucide-react";
import Image from "next/image";
import { getTranslations } from "next-intl/server";

import { Container } from "@/components/layout/Container";
import { ABOUT_IMAGES } from "@/config/about-images";

const STAT_KEYS = ["support", "rating", "booking"] as const;

export async function AboutHero() {
  const t = await getTranslations("about.hero");

  return (
    <section className="relative isolate min-h-[52vh] overflow-hidden bg-ink lg:min-h-[58vh]">
      <Image
        src={ABOUT_IMAGES.hero}
        alt=""
        fill
        priority
        sizes="100vw"
        className="absolute inset-0 -z-10 object-cover"
      />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ink/90 via-ink/72 to-ink/95"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-ink/75 via-transparent to-ink/50"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_55%_at_50%_0%,rgb(200_164_93/0.22),transparent_68%)]"
      />

      <Container className="relative flex min-h-[52vh] flex-col justify-end pb-14 pt-20 lg:min-h-[58vh] lg:pb-20 lg:pt-28">
        <div className="max-w-3xl animate-fade-up space-y-5">
          <p className="ring-gold-hairline inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-gold-light backdrop-blur-md sm:text-xs">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            {t("badge")}
          </p>

          <h1 className="text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
            {t("title")}
            <span className="mt-1 block text-gold-shimmer">{t("titleAccent")}</span>
          </h1>

          <p className="max-w-2xl text-sm leading-relaxed text-white/72 sm:text-base lg:text-lg">
            {t("subtitle")}
          </p>

          <div className="flex flex-wrap gap-2 pt-1">
            {STAT_KEYS.map((key) => (
              <span
                key={key}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/8 px-3 py-1.5 text-xs font-semibold text-white/85 backdrop-blur-md"
              >
                {key === "rating" && (
                  <Star className="h-3.5 w-3.5 fill-gold text-gold" aria-hidden />
                )}
                {key === "support" && (
                  <ShieldCheck className="h-3.5 w-3.5 text-gold" aria-hidden />
                )}
                {key === "booking" && (
                  <Sparkles className="h-3.5 w-3.5 text-gold" aria-hidden />
                )}
                {t(`stats.${key}`)}
              </span>
            ))}
          </div>
        </div>
      </Container>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent"
      />
    </section>
  );
}
