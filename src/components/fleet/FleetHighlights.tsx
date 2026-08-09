import { Gem, ShieldCheck, Sparkles } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { FeatureCard } from "@/components/marketing/marketing-cards";
import { Reveal } from "@/components/motion/Reveal";

const HIGHLIGHT_ICONS = [Gem, ShieldCheck, Sparkles] as const;
const HIGHLIGHT_KEYS = ["0", "1", "2"] as const;

export async function FleetHighlights() {
  const t = await getTranslations("fleet.highlights");

  return (
    <Section variant="muted">
      <Container>
        <SectionHeading
          eyebrow={t("eyebrow")}
          title={t("title")}
          subtitle={t("subtitle")}
        />
        <div className="grid gap-5 md:grid-cols-3">
          {HIGHLIGHT_KEYS.map((key, index) => {
            const Icon = HIGHLIGHT_ICONS[index]!;

            return (
              <Reveal key={key} delay={index * 80} className="h-full">
                <FeatureCard
                  icon={<Icon className="h-6 w-6" />}
                  title={t(`items.${key}.title`)}
                  description={t(`items.${key}.description`)}
                />
              </Reveal>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
