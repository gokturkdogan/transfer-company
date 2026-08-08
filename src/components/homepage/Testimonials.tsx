import { getTranslations } from "next-intl/server";

import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { ReviewCard } from "@/components/marketing/marketing-cards";

export async function Testimonials() {
  const t = await getTranslations("home.testimonials");

  const items = [0, 1, 2] as const;

  return (
    <Section>
      <Container>
        <SectionHeading eyebrow={t("eyebrow")} title={t("title")} />
        <div className="grid gap-6 md:grid-cols-3">
          {items.map((index) => (
            <ReviewCard
              key={index}
              quote={t(`items.${index}.quote`)}
              author={t(`items.${index}.author`)}
              rating={5}
            />
          ))}
        </div>
      </Container>
    </Section>
  );
}
