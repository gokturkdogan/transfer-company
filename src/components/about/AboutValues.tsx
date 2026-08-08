import { Clock, Gem, HeartHandshake } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { FeatureCard } from "@/components/marketing/marketing-cards";
import { Reveal } from "@/components/motion/Reveal";

const VALUE_ICONS = [Gem, HeartHandshake, Clock] as const;
const VALUE_KEYS = ["0", "1", "2"] as const;

export async function AboutValues() {
  const t = await getTranslations("about.values");

  return (
    <Section variant="muted">
      <Container>
        <SectionHeading
          eyebrow={t("eyebrow")}
          title={t("title")}
          subtitle={t("subtitle")}
        />

        <div className="grid gap-5 md:grid-cols-3">
          {VALUE_KEYS.map((key, index) => {
            const Icon = VALUE_ICONS[index]!;

            return (
              <Reveal key={key} delay={index * 80} className="h-full">
                <div className="relative h-full">
                  <span className="absolute -top-2.5 start-6 z-10 rounded-full border border-gold/35 bg-background px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-gold-deep shadow-sm">
                    {t(`items.${key}.badge`)}
                  </span>
                  <FeatureCard
                    icon={<Icon className="h-6 w-6" />}
                    title={t(`items.${key}.title`)}
                    description={t(`items.${key}.description`)}
                  />
                </div>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
