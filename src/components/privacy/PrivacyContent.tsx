import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";

function isEffectivelyEmpty(html: string): boolean {
  return html.replace(/<[^>]+>/g, "").replace(/\s+/g, "").length === 0;
}

export function PrivacyContent({
  html,
  locale,
}: {
  html: string;
  locale: string;
}) {
  const hasContent = !isEffectivelyEmpty(html);
  const isRtl = locale === "ar";

  return (
    <Section className="py-12 md:py-16">
      <Container>
        {hasContent ? (
          <article
            dir={isRtl ? "rtl" : "ltr"}
            lang={locale}
            className="privacy-legal-content mx-auto max-w-4xl lg:max-w-5xl"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        ) : (
          <p className="mx-auto max-w-4xl text-sm text-muted-foreground sm:text-base">
            Bu dil için aydınlatma metni henüz eklenmedi.
          </p>
        )}
      </Container>
    </Section>
  );
}
