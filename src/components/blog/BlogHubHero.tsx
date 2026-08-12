import { BookOpen, Sparkles } from "lucide-react";
import Image from "next/image";
import { getTranslations } from "next-intl/server";

import { Container } from "@/components/layout/Container";
import { BLOG_PAGE_IMAGES } from "@/config/blog-images";

export async function BlogHubHero() {
  const t = await getTranslations("blog.hub");

  return (
    <section className="relative isolate min-h-[48vh] overflow-hidden bg-ink lg:min-h-[54vh]">
      <Image
        src={BLOG_PAGE_IMAGES.hero}
        alt=""
        fill
        priority
        sizes="100vw"
        className="absolute inset-0 -z-10 object-cover"
      />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ink/92 via-ink/78 to-ink/96"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-ink/80 via-ink/35 to-ink/70"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(68%_52%_at_50%_0%,rgb(200_164_93/0.26),transparent_70%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 futuristic-grid opacity-35 [mask-image:radial-gradient(62%_58%_at_50%_42%,#000,transparent)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-20 start-1/4 h-[24rem] w-[24rem] animate-aurora rounded-full bg-gold/12 blur-[130px]"
      />

      <Container className="relative flex min-h-[48vh] flex-col justify-end pb-12 pt-24 lg:min-h-[54vh] lg:pb-16 lg:pt-28">
        <div className="mx-auto max-w-3xl animate-fade-up space-y-4 text-center">
          <p className="ring-gold-hairline inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-gold-light backdrop-blur-md sm:text-xs">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            {t("badge")}
          </p>

          <h1 className="text-3xl font-bold leading-[1.08] tracking-tight text-white sm:text-4xl lg:text-[2.65rem] lg:leading-tight">
            {t("title")}
          </h1>

          <p className="text-base leading-relaxed text-white/72 sm:text-lg">
            {t("subtitle")}
          </p>

          <p className="inline-flex items-center gap-2 text-xs font-medium text-white/55">
            <BookOpen className="h-4 w-4 text-gold" aria-hidden />
            {t("note")}
          </p>
        </div>
      </Container>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold/70 to-transparent"
      />
    </section>
  );
}
