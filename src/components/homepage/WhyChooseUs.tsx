import {
  Clock,
  Gem,
  ShieldCheck,
  Sparkles,
  Users,
  Wallet,
} from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { FeatureCard } from "@/components/marketing/marketing-cards";
import { Reveal } from "@/components/motion/Reveal";

const featureIcons = [
  Gem,
  ShieldCheck,
  Clock,
  Users,
  Wallet,
  Sparkles,
] as const;

export async function WhyChooseUs() {
  const t = await getTranslations("home.whyUs");

  const features = [0, 1, 2, 3, 4, 5] as const;

  return (
    <Section id="why-us" variant="ink">
      <Container>
        <SectionHeading
          eyebrow={t("eyebrow")}
          title={t("title")}
          subtitle={t("subtitle")}
          dark
        />
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map((index) => {
            const Icon = featureIcons[index]!;

            return (
              <Reveal key={index} delay={index * 70} className="h-full">
                <FeatureCard
                  dark
                  icon={<Icon className="h-6 w-6" />}
                  title={t(`features.${index}.title`)}
                  description={t(`features.${index}.description`)}
                />
              </Reveal>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
