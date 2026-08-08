import { getTranslations } from "next-intl/server";

import { Container } from "@/components/layout/Container";
import { Reveal } from "@/components/motion/Reveal";

const STAT_KEYS = ["transfers", "rating", "fleet", "support"] as const;

export async function StatsBand() {
  const t = await getTranslations("home.stats");

  return (
    <section className="relative isolate overflow-hidden surface-ink py-16 text-white md:py-20">
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 futuristic-grid [mask-image:radial-gradient(52%_60%_at_50%_50%,#000,transparent)]"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -bottom-40 start-1/3 h-[26rem] w-[26rem] animate-aurora rounded-full bg-gold/14 blur-[150px]"
      />

      <Container className="relative">
        <Reveal className="mx-auto mb-12 max-w-2xl text-center">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.22em] text-gold">
            {t("eyebrow")}
          </p>
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {t("title")}
          </h2>
        </Reveal>

        <dl className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
          {STAT_KEYS.map((key, index) => (
            <Reveal
              key={key}
              delay={index * 90}
              className="relative text-center lg:border-e lg:border-white/10 lg:last:border-e-0"
            >
              <dt className="sr-only">{t(`items.${key}.label`)}</dt>
              <dd>
                <span className="block text-4xl font-bold tracking-tight text-gold-gradient sm:text-5xl">
                  {t(`items.${key}.value`)}
                </span>
                <span className="mt-2.5 block text-xs font-semibold uppercase tracking-[0.14em] text-white/55 sm:text-sm sm:tracking-[0.1em]">
                  {t(`items.${key}.label`)}
                </span>
              </dd>
            </Reveal>
          ))}
        </dl>
      </Container>
    </section>
  );
}
