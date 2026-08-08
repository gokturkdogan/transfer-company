import { CalendarCheck, Car, MapPin, PlaneLanding } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { StepCard } from "@/components/marketing/marketing-cards";

const stepIcons = [CalendarCheck, MapPin, PlaneLanding, Car] as const;

export async function HowItWorks() {
  const t = await getTranslations("home.howItWorks");

  const steps = [0, 1, 2, 3] as const;

  return (
    <Section>
      <Container>
        <SectionHeading
          eyebrow={t("eyebrow")}
          title={t("title")}
          subtitle={t("subtitle")}
        />
        <div className="grid gap-10 md:grid-cols-4">
          {steps.map((index) => {
            const Icon = stepIcons[index]!;
            return (
              <StepCard
                key={index}
                step={index + 1}
                icon={<Icon className="h-8 w-8" />}
                title={t(`steps.${index}.title`)}
                description={t(`steps.${index}.description`)}
              />
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
