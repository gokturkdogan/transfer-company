import { getTranslations } from "next-intl/server";

import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { ReviewCard } from "@/components/marketing/marketing-cards";
import { Reveal } from "@/components/motion/Reveal";

export async function Testimonials() {
  const t = await getTranslations("home.testimonials");

  const items = [0, 1, 2] as const;

  return (
    <Section id="reviews">
      <Container>
        <SectionHeading eyebrow={t("eyebrow")} title={t("title")} />
        <div className="grid gap-5 md:grid-cols-3">
          {items.map((index) => (
            <Reveal key={index} delay={index * 90} className="h-full">
              <ReviewCard
                quote={t(`items.${index}.quote`)}
                author={t(`items.${index}.author`)}
                rating={5}
              />
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}
