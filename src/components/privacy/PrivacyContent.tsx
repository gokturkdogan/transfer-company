import type { ReactNode } from "react";
import { Mail } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Reveal } from "@/components/motion/Reveal";
import { siteConfig } from "@/config/site";
import { toMailtoHref } from "@/features/contact/domain/contact-links";

const OVERVIEW_KEYS = ["0", "1"] as const;
const COOKIE_KEYS = ["locale"] as const;

function LegalBlock({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
        {title}
      </h2>
      <div className="space-y-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
        {children}
      </div>
    </div>
  );
}

export async function PrivacyContent() {
  const t = await getTranslations("privacy.sections");

  return (
    <>
      <Section>
        <Container>
          <Reveal className="mx-auto max-w-3xl space-y-12">
            <LegalBlock title={t("overview.title")}>
              {OVERVIEW_KEYS.map((key) => (
                <p key={key}>{t(`overview.paragraphs.${key}`)}</p>
              ))}
            </LegalBlock>

            <LegalBlock title={t("cookies.title")}>
              <p>{t("cookies.intro")}</p>
              <div className="overflow-x-auto rounded-2xl border border-border/70 shadow-premium">
                <table className="w-full min-w-[28rem] text-start text-sm">
                  <thead>
                    <tr className="border-b border-border/70 bg-muted/50">
                      <th className="px-4 py-3 text-start text-[11px] font-bold uppercase tracking-[0.14em] text-gold">
                        {t("cookies.table.name")}
                      </th>
                      <th className="px-4 py-3 text-start text-[11px] font-bold uppercase tracking-[0.14em] text-gold">
                        {t("cookies.table.purpose")}
                      </th>
                      <th className="px-4 py-3 text-start text-[11px] font-bold uppercase tracking-[0.14em] text-gold">
                        {t("cookies.table.duration")}
                      </th>
                      <th className="px-4 py-3 text-start text-[11px] font-bold uppercase tracking-[0.14em] text-gold">
                        {t("cookies.table.type")}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60 bg-background">
                    {COOKIE_KEYS.map((key) => (
                      <tr key={key}>
                        <td className="px-4 py-3 font-mono text-xs text-foreground">
                          {t(`cookies.items.${key}.name`)}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {t(`cookies.items.${key}.purpose`)}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {t(`cookies.items.${key}.duration`)}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {t(`cookies.items.${key}.type`)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </LegalBlock>
          </Reveal>
        </Container>
      </Section>

      <Section variant="muted">
        <Container>
          <Reveal className="mx-auto max-w-3xl space-y-12">
            <LegalBlock title={t("noMarketing.title")}>
              <p>{t("noMarketing.body")}</p>
            </LegalBlock>

            <LegalBlock title={t("thirdParty.title")}>
              <p>{t("thirdParty.body")}</p>
            </LegalBlock>
          </Reveal>
        </Container>
      </Section>

      <Section variant="ink">
        <Container>
          <Reveal className="mx-auto max-w-3xl space-y-8">
            <div className="space-y-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-gold">
                {t("rights.eyebrow")}
              </p>
              <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                {t("rights.title")}
              </h2>
              <p className="text-sm leading-relaxed text-white/65 sm:text-base">
                {t("rights.body")}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-white">{t("contact.title")}</h3>
              <p className="mt-3 text-sm leading-relaxed text-white/65 sm:text-base">
                {t("contact.body")}
              </p>
              <a
                href={toMailtoHref(siteConfig.email)}
                className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-gold-light transition-colors hover:text-gold"
              >
                <Mail className="h-4 w-4" aria-hidden />
                {siteConfig.email}
              </a>
            </div>
          </Reveal>
        </Container>
      </Section>
    </>
  );
}
