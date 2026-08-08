import Image from "next/image";
import { getTranslations } from "next-intl/server";

import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Reveal } from "@/components/motion/Reveal";
import { ABOUT_IMAGES } from "@/config/about-images";

const BADGE_KEYS = ["0", "1", "2"] as const;

export async function AboutPromise() {
  const t = await getTranslations("about.promise");

  return (
    <Section variant="ink">
      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
          <Reveal>
            <div className="relative overflow-hidden rounded-[1.5rem] border border-white/10 shadow-premium">
              <div className="relative aspect-[4/3] lg:aspect-[5/4]">
                <Image
                  src={ABOUT_IMAGES.meetGreet}
                  alt={t("imageAlt")}
                  fill
                  sizes="(max-width: 1024px) 100vw, 55vw"
                  className="object-cover"
                />
              </div>
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/55 via-ink/10 to-transparent"
              />
            </div>
          </Reveal>

          <Reveal delay={100} className="space-y-6">
            <div className="space-y-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-gold">
                {t("eyebrow")}
              </p>
              <h2 className="text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
                {t("title")}
              </h2>
              <p className="text-base leading-relaxed text-white/65">{t("description")}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              {BADGE_KEYS.map((key) => (
                <span
                  key={key}
                  className="rounded-full border border-white/15 bg-white/8 px-3.5 py-1.5 text-xs font-semibold text-white/85 backdrop-blur-md"
                >
                  {t(`badges.${key}`)}
                </span>
              ))}
            </div>
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}
