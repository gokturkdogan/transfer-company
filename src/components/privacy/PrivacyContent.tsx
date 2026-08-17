import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";

function isEffectivelyEmpty(html: string): boolean {
  return html.replace(/<[^>]+>/g, "").replace(/\s+/g, "").length === 0;
}

export function PrivacyContent({ html }: { html: string }) {
  const hasContent = !isEffectivelyEmpty(html);

  return (
    <Section>
      <Container>
        <div className="mx-auto max-w-3xl">
          {hasContent ? (
            <article
              className="privacy-legal-content text-muted-foreground [&_a]:font-medium [&_a]:text-gold [&_a]:underline-offset-2 hover:[&_a]:text-gold-light [&_h1]:mb-4 [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:tracking-tight [&_h1]:text-foreground [&_h2]:mb-3 [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:tracking-tight [&_h2]:text-foreground [&_h3]:mb-2 [&_h3]:mt-6 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-foreground [&_h4]:mb-2 [&_h4]:mt-4 [&_h4]:text-base [&_h4]:font-semibold [&_h4]:text-foreground [&_hr]:my-8 [&_hr]:border-border/70 [&_li]:text-muted-foreground [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:ps-5 [&_p]:mb-4 [&_p]:text-sm [&_p]:leading-relaxed [&_p]:text-muted-foreground [&_p]:sm:text-base [&_ul]:my-4 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:ps-5"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          ) : (
            <p className="text-sm text-muted-foreground sm:text-base">
              Bu dil için aydınlatma metni henüz eklenmedi.
            </p>
          )}
        </div>
      </Container>
    </Section>
  );
}
