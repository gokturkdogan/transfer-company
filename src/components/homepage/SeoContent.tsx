import { Check } from "lucide-react";
import Image from "next/image";
import { getTranslations } from "next-intl/server";

import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Reveal } from "@/components/motion/Reveal";
import { HOMEPAGE_IMAGES } from "@/config/homepage-images";

const BLOCK_KEYS = ["service", "pricing", "experience"] as const;
const HIGHLIGHT_KEYS = ["support", "fleet", "payment", "booking"] as const;

/**
 * Long-form editorial block. Carries the crawlable keyword context the rest of
 * the homepage intentionally keeps short.
 */
export async function SeoContent() {
  const t = await getTranslations("home.seo");

  return (
    <Section id="guide">
      <Container>
        <div className="grid items-start gap-12 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
          <Reveal className="space-y-8">
            <div className="space-y-4">
              <p className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.22em] text-gold">
                <span
                  aria-hidden
                  className="h-px w-8 bg-gradient-to-r from-transparent to-gold"
                />
                {t("eyebrow")}
              </p>
              <h2 className="text-3xl font-bold leading-[1.15] tracking-tight sm:text-4xl">
                {t("title")}
              </h2>
              <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
                {t("intro")}
              </p>
            </div>

            <div className="space-y-7">
              {BLOCK_KEYS.map((key) => (
                <article key={key} className="space-y-2.5">
                  <h3 className="flex items-start gap-3 text-lg font-bold tracking-tight">
                    <span
                      aria-hidden
                      className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold"
                    />
                    {t(`blocks.${key}.title`)}
                  </h3>
                  <p className="ps-6 text-sm leading-relaxed text-muted-foreground">
                    {t(`blocks.${key}.body`)}
                  </p>
                </article>
              ))}
            </div>
          </Reveal>

          <Reveal delay={140} className="space-y-5">
            <div className="group relative overflow-hidden rounded-3xl bg-ink shadow-premium">
              <div className="relative aspect-[4/3]">
                <Image
                  src={HOMEPAGE_IMAGES.howItWorks.meetGreet}
                  alt={t("imageAlt")}
                  fill
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.05]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/25 to-transparent" />
                <span
                  aria-hidden
                  className="absolute inset-0 rounded-3xl border border-white/12"
                />
                <p className="absolute inset-x-0 bottom-0 p-6 text-sm font-semibold text-white/90">
                  {t("imageCaption")}
                </p>
              </div>
            </div>

            <ul className="grid gap-3 sm:grid-cols-2">
              {HIGHLIGHT_KEYS.map((key) => (
                <li
                  key={key}
                  className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4 shadow-float transition-colors duration-300 hover:border-gold/40"
                >
                  <span
                    aria-hidden
                    className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-gold/12 text-gold-deep"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </span>
                  <span className="space-y-1">
                    <span className="block text-sm font-bold tracking-tight">
                      {t(`highlights.${key}.title`)}
                    </span>
                    <span className="block text-xs leading-relaxed text-muted-foreground">
                      {t(`highlights.${key}.value`)}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}
