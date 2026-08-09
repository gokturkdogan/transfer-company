import { ArrowRight, Phone } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Container } from "@/components/layout/Container";
import { Reveal } from "@/components/motion/Reveal";
import { Link } from "@/i18n/navigation";
import {
  pickPrimaryChannel,
  toTelHref,
} from "@/features/contact/domain/contact-links";
import { getPublicContactChannels } from "@/features/contact/server/public-contact";

export async function FinalCta() {
  const [t, contactChannels] = await Promise.all([
    getTranslations("home.cta"),
    getPublicContactChannels(),
  ]);
  const primaryPhone = pickPrimaryChannel(contactChannels.phones, "");

  return (
    <section className="relative isolate overflow-hidden surface-ink py-24 text-white md:py-32">
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_60%_at_50%_110%,rgb(200_164_93/0.24),transparent_70%)]"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -top-40 start-1/2 h-[30rem] w-[30rem] -translate-x-1/2 animate-aurora rounded-full bg-gold/14 blur-[150px]"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 animate-grid-drift futuristic-grid [mask-image:radial-gradient(48%_52%_at_50%_50%,#000,transparent)]"
      />

      <Container className="relative">
        <Reveal className="mx-auto max-w-3xl space-y-7 text-center">
          <p className="ring-gold-hairline inline-flex items-center gap-2 rounded-full bg-white/8 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-gold-light backdrop-blur-md">
            {t("eyebrow")}
          </p>

          <h2 className="text-3xl font-bold leading-[1.1] tracking-tight sm:text-4xl lg:text-5xl">
            {t("title")}
            <span className="mt-1.5 block text-gold-shimmer">
              {t("titleAccent")}
            </span>
          </h2>

          <p className="mx-auto max-w-xl text-base leading-relaxed text-white/65 sm:text-lg">
            {t("subtitle")}
          </p>

          <div className="flex flex-col items-center justify-center gap-3 pt-2 sm:flex-row">
            <Link
              href="/booking"
              className="group flex h-13 w-full items-center justify-center gap-2 rounded-full bg-gold-gradient px-8 text-sm font-bold text-ink shadow-gold transition-all duration-300 hover:brightness-110 sm:w-auto"
            >
              {t("button")}
              <ArrowRight
                className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 rtl:rotate-180"
                aria-hidden
              />
            </Link>
            <a
              href={toTelHref(primaryPhone)}
              className="flex h-13 w-full items-center justify-center gap-2 rounded-full border border-white/20 bg-white/8 px-8 text-sm font-semibold text-white backdrop-blur-md transition-colors duration-300 hover:border-gold/50 hover:text-gold-light sm:w-auto"
            >
              <Phone className="h-4 w-4" aria-hidden />
              {primaryPhone}
            </a>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
