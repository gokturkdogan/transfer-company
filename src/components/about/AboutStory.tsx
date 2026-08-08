import Image from "next/image";
import { getTranslations } from "next-intl/server";

import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Reveal } from "@/components/motion/Reveal";
import { ABOUT_IMAGES } from "@/config/about-images";

const PARAGRAPH_KEYS = ["0", "1"] as const;

export async function AboutStory() {
  const t = await getTranslations("about.story");

  return (
    <Section>
      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <Reveal className="space-y-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-gold">
              {t("eyebrow")}
            </p>
            <h2 className="text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl">
              {t("title")}
            </h2>
            <div className="space-y-4 text-base leading-relaxed text-muted-foreground">
              {PARAGRAPH_KEYS.map((key) => (
                <p key={key}>{t(`paragraphs.${key}`)}</p>
              ))}
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="relative overflow-hidden rounded-[1.5rem] border border-border/70 shadow-premium">
              <div className="relative aspect-[4/3]">
                <Image
                  src={ABOUT_IMAGES.chauffeur}
                  alt={t("imageAlt")}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/35 via-transparent to-transparent"
              />
              <span className="absolute bottom-4 start-4 rounded-full border border-white/20 bg-ink/55 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-gold-light backdrop-blur-md">
                {t("imageBadge")}
              </span>
            </div>
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}
