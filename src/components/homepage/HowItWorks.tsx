import { CalendarCheck, Car, MapPin, PlaneLanding } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { StepCard } from "@/components/marketing/marketing-cards";
import { Reveal } from "@/components/motion/Reveal";

const stepIcons = [CalendarCheck, MapPin, PlaneLanding, Car] as const;

export async function HowItWorks() {
  const t = await getTranslations("home.howItWorks");

  const steps = [0, 1, 2, 3] as const;

  return (
    <Section id="how-it-works">
      <Container>
        <SectionHeading
          eyebrow={t("eyebrow")}
          title={t("title")}
          subtitle={t("subtitle")}
        />

        <div className="relative">
          {/* Gold rail linking the four steps on wide screens */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-[12%] top-8 hidden h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent md:block"
          />

          <div className="relative grid gap-12 md:grid-cols-4 md:gap-8">
            {steps.map((index) => {
              const Icon = stepIcons[index]!;

              return (
                <Reveal key={index} delay={index * 110}>
                  <StepCard
                    step={index + 1}
                    icon={<Icon className="h-7 w-7" />}
                    title={t(`steps.${index}.title`)}
                    description={t(`steps.${index}.description`)}
                  />
                </Reveal>
              );
            })}
          </div>
        </div>
      </Container>
    </Section>
  );
}
