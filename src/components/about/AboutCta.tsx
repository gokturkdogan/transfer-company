import { ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Container } from "@/components/layout/Container";
import { Reveal } from "@/components/motion/Reveal";
import { Link } from "@/i18n/navigation";

export async function AboutCta() {
  const t = await getTranslations("about.cta");

  return (
    <section className="border-t border-border/60 bg-muted/40 py-16 md:py-20">
      <Container>
        <Reveal className="mx-auto max-w-2xl space-y-5 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {t("title")}
          </h2>
          <p className="text-base leading-relaxed text-muted-foreground">{t("subtitle")}</p>
          <Link
            href="/booking"
            className="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-gold-gradient px-7 text-sm font-bold text-ink shadow-gold transition-all duration-300 hover:brightness-110"
          >
            {t("button")}
            <ArrowRight
              className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 rtl:rotate-180"
              aria-hidden
            />
          </Link>
        </Reveal>
      </Container>
    </section>
  );
}
