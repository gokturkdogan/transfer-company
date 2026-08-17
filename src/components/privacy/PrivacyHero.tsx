import { Cookie, ShieldCheck } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Container } from "@/components/layout/Container";

const HIGHLIGHT_KEYS = ["essential", "noTracking"] as const;

export async function PrivacyHero() {
  const t = await getTranslations("privacy.hero");

  return (
    <section className="relative isolate overflow-hidden bg-ink">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_55%_at_50%_0%,rgb(200_164_93/0.2),transparent_68%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 futuristic-grid [mask-image:radial-gradient(58%_54%_at_50%_46%,#000,transparent)]"
      />

      <Container className="relative py-16 md:py-20">
        <div className="mx-auto max-w-4xl animate-fade-up space-y-5 text-center lg:max-w-5xl">
          <p className="ring-gold-hairline mx-auto inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-gold-light backdrop-blur-md sm:text-xs">
            <Cookie className="h-3.5 w-3.5" aria-hidden />
            {t("badge")}
          </p>

          <h1 className="text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-[2.75rem]">
            {t("title")}
            <span className="mt-1 block text-gold-shimmer">{t("titleAccent")}</span>
          </h1>

          <p className="mx-auto max-w-2xl text-sm leading-relaxed text-white/70 sm:text-base">
            {t("subtitle")}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            {HIGHLIGHT_KEYS.map((key) => (
              <span
                key={key}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/8 px-3 py-1.5 text-xs font-semibold text-white/85 backdrop-blur-md"
              >
                {key === "essential" && (
                  <ShieldCheck className="h-3.5 w-3.5 text-gold" aria-hidden />
                )}
                {key === "noTracking" && (
                  <Cookie className="h-3.5 w-3.5 text-gold" aria-hidden />
                )}
                {t(`highlights.${key}`)}
              </span>
            ))}
          </div>

          <p className="text-xs text-white/45">{t("updated")}</p>
        </div>
      </Container>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent"
      />
    </section>
  );
}
