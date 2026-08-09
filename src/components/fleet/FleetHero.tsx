import { Car, ShieldCheck, Sparkles, Users } from "lucide-react";
import Image from "next/image";
import { getTranslations } from "next-intl/server";

import { Container } from "@/components/layout/Container";
import { FLEET_PAGE_IMAGES } from "@/config/fleet-images";

const STAT_KEYS = ["vehicles", "comfort", "support"] as const;

export async function FleetHero() {
  const t = await getTranslations("fleet.hero");

  return (
    <section className="relative isolate min-h-[58vh] overflow-hidden bg-ink lg:min-h-[64vh]">
      <Image
        src={FLEET_PAGE_IMAGES.hero}
        alt=""
        fill
        priority
        sizes="100vw"
        className="absolute inset-0 -z-10 object-cover"
      />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ink/92 via-ink/78 to-ink/96"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-ink/80 via-ink/35 to-ink/70"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(68%_52%_at_50%_0%,rgb(200_164_93/0.28),transparent_70%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 futuristic-grid opacity-40 [mask-image:radial-gradient(62%_58%_at_50%_42%,#000,transparent)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 start-1/3 h-[28rem] w-[28rem] animate-aurora rounded-full bg-gold/14 blur-[140px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 end-1/4 h-[22rem] w-[22rem] animate-aurora rounded-full bg-gold/10 blur-[120px] [animation-delay:2s]"
      />

      <Container className="relative flex min-h-[58vh] flex-col justify-end pb-14 pt-24 lg:min-h-[64vh] lg:pb-20 lg:pt-32">
        <div className="max-w-3xl animate-fade-up space-y-5">
          <p className="ring-gold-hairline inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-gold-light backdrop-blur-md sm:text-xs">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            {t("badge")}
          </p>

          <h1 className="text-3xl font-bold leading-[1.08] tracking-tight text-white sm:text-4xl lg:text-5xl">
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
                {key === "vehicles" && (
                  <Car className="h-3.5 w-3.5 text-gold" aria-hidden />
                )}
                {key === "comfort" && (
                  <ShieldCheck className="h-3.5 w-3.5 text-gold" aria-hidden />
                )}
                {key === "support" && (
                  <Users className="h-3.5 w-3.5 text-gold" aria-hidden />
                )}
                {t(`stats.${key}`)}
              </span>
            ))}
          </div>
        </div>
      </Container>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold/70 to-transparent"
      />
    </section>
  );
}
