import { Plus } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";

export async function FaqSection() {
  const t = await getTranslations("home.faq");

  const items = [0, 1, 2, 3, 4, 5] as const;

  return (
    <Section id="faq" variant="muted">
      <Container>
        <SectionHeading
          eyebrow={t("eyebrow")}
          title={t("title")}
          subtitle={t("subtitle")}
        />
        <div className="mx-auto max-w-3xl space-y-3">
          {items.map((index) => (
            <Reveal key={index} delay={index * 60}>
              <details className="group rounded-2xl border border-border bg-card px-5 py-4 shadow-float transition-colors duration-300 open:border-gold/40 sm:px-6">
                <summary className="cursor-pointer list-none marker:content-none [&::-webkit-details-marker]:hidden">
                  <span className="flex items-center justify-between gap-4">
                    <h3 className="text-base font-semibold tracking-tight">
                      {t(`items.${index}.question`)}
                    </h3>
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold/12 text-gold-deep transition-all duration-300 group-open:rotate-45 group-open:bg-gold-gradient group-open:text-ink">
                      <Plus className="h-4 w-4" aria-hidden />
                    </span>
                  </span>
                </summary>
                <p className="mt-4 border-t border-border pt-4 text-sm leading-relaxed text-muted-foreground">
                  {t(`items.${index}.answer`)}
                </p>
              </details>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}
