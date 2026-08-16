import { getTranslations } from "next-intl/server";

import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Reveal } from "@/components/motion/Reveal";
import { SocialMediaIconLinks } from "@/components/shared/SocialMediaIconLinks";
import { getCachedSocialMediaLinks } from "@/server/cache/social-media";

export async function AboutSocialMedia() {
  const links = await getCachedSocialMediaLinks();

  if (links.length === 0) {
    return null;
  }

  const t = await getTranslations("about.social");

  return (
    <Section variant="ink">
      <Container>
        <Reveal className="mx-auto max-w-3xl text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-gold">
            {t("eyebrow")}
          </p>
          <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
            {t("title")}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-white/70 sm:text-base">
            {t("subtitle")}
          </p>

          <SocialMediaIconLinks
            links={links}
            className="mt-8"
            listClassName="justify-center gap-3 sm:gap-4"
          />
        </Reveal>
      </Container>
    </Section>
  );
}
