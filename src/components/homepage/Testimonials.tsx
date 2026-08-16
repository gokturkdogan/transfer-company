import { getLocale, getTranslations } from "next-intl/server";

import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { ReviewCard } from "@/components/marketing/marketing-cards";
import { Reveal } from "@/components/motion/Reveal";
import { getCachedHomeTestimonials } from "@/server/cache/home-testimonials";

export async function Testimonials() {
  const t = await getTranslations("home.testimonials");
  const locale = await getLocale();
  const items = await getCachedHomeTestimonials(locale);

  if (items.length === 0) {
    return null;
  }

  return (
    <Section id="reviews">
      <Container>
        <SectionHeading eyebrow={t("eyebrow")} title={t("title")} />
        <div className="grid gap-5 md:grid-cols-3">
          {items.map((item, index) => (
            <Reveal key={`${item.authorName}-${index}`} delay={index * 90} className="h-full">
              <ReviewCard
                quote={item.quote}
                authorInitials={item.authorInitials}
                authorName={item.authorName}
                rating={item.rating}
              />
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}
