import { getTranslations } from "next-intl/server";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";

export async function FinalCta() {
  const t = await getTranslations("home.cta");

  return (
    <Section variant="dark" className="text-center">
      <Container>
        <div className="mx-auto max-w-2xl space-y-6">
          <h2 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
            {t("title")}
          </h2>
          <p className="text-lg text-white/70">{t("subtitle")}</p>
          <Button variant="gold" size="lg" asChild>
            <a href="#booking">{t("button")}</a>
          </Button>
        </div>
      </Container>
    </Section>
  );
}
