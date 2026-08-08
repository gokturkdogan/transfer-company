import { getTranslations } from "next-intl/server";

import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { SectionHeading } from "@/components/layout/SectionHeading";

export async function FaqSection() {
  const t = await getTranslations("home.faq");

  const items = [0, 1, 2, 3, 4, 5] as const;

  return (
    <Section variant="muted">
      <Container>
        <SectionHeading eyebrow={t("eyebrow")} title={t("title")} />
        <div className="mx-auto max-w-3xl space-y-3">
          {items.map((index) => (
            <details
              key={index}
              className="group rounded-2xl border border-border bg-card px-6 py-4 shadow-sm open:shadow-md"
            >
              <summary className="cursor-pointer list-none text-base font-semibold marker:content-none [&::-webkit-details-marker]:hidden">
                <span className="flex items-center justify-between gap-4">
                  {t(`items.${index}.question`)}
                  <span className="text-accent transition-transform group-open:rotate-45">
                    +
                  </span>
                </span>
              </summary>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                {t(`items.${index}.answer`)}
              </p>
            </details>
          ))}
        </div>
      </Container>
    </Section>
  );
}
