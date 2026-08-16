import { ArrowRight, Calendar, Clock } from "lucide-react";
import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";

import { Container } from "@/components/layout/Container";
import type { BlogLocaleContent, BlogPostDefinition } from "@/content/blog/types";
import { Link } from "@/i18n/navigation";

type BlogArticleViewProps = {
  post: BlogPostDefinition;
  content: BlogLocaleContent;
  coverImageAlt: string;
  transferHref: string | null;
};

export async function BlogArticleView({
  post,
  content,
  coverImageAlt,
  transferHref,
}: BlogArticleViewProps) {
  const t = await getTranslations("blog");
  const locale = await getLocale();

  return (
    <>
      <section className="relative isolate overflow-hidden bg-ink text-white">
        <div className="absolute inset-0">
          <Image
            src={post.coverImage}
            alt={coverImageAlt}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-ink/85 via-ink/70 to-ink" />
        </div>

        <Container className="relative py-16 md:py-24">
          <div className="mx-auto max-w-3xl space-y-5">
            <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-white/65">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-gold" aria-hidden />
                {t("published", {
                  date: formatBlogDate(post.publishedAt, locale),
                })}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-gold" aria-hidden />
                {t("readingTime", { minutes: content.readingMinutes })}
              </span>
            </div>

            <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-[2.5rem] lg:leading-[1.15]">
              {content.title}
            </h1>

            <p className="text-base leading-relaxed text-white/78 sm:text-lg">
              {content.intro}
            </p>
          </div>
        </Container>
      </section>

      <article className="bg-background py-12 md:py-16">
        <Container>
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-16">
            <div className="min-w-0 space-y-10">
              {content.pullQuote && (
                <blockquote
                  className="rounded-2xl border border-gold/25 bg-gold/6 px-5 py-5 text-base font-medium leading-relaxed text-foreground sm:px-6 sm:text-lg"
                >
                  <span
                    aria-hidden
                    className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-gold-deep"
                  >
                    {t("editorsNote")}
                  </span>
                  {content.pullQuote}
                </blockquote>
              )}

              {content.sections.map((section) => (
                <section key={section.title} className="space-y-4">
                  <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                    {section.title}
                  </h2>
                  <div className="space-y-4 text-base leading-[1.75] text-muted-foreground">
                    {section.paragraphs.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                </section>
              ))}

              {content.tips && content.tips.length > 0 && (
                <section className="rounded-2xl border border-border bg-card p-5 shadow-float sm:p-6">
                  <h2 className="mb-4 text-lg font-bold tracking-tight">
                    {t("practicalTips")}
                  </h2>
                  <ul className="space-y-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                    {content.tips.map((tip) => (
                      <li key={tip} className="flex gap-3">
                        <span
                          aria-hidden
                          className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold"
                        />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {content.faq && content.faq.length > 0 && (
                <section className="space-y-5">
                  <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
                    {t("faqTitle")}
                  </h2>
                  <div className="space-y-4">
                    {content.faq.map((item) => (
                      <div
                        key={item.question}
                        className="rounded-xl border border-border/80 bg-muted/30 px-5 py-4"
                      >
                        <h3 className="text-sm font-bold text-foreground sm:text-base">
                          {item.question}
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
                          {item.answer}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            <aside className="space-y-5 lg:sticky lg:top-28 lg:self-start">
              <div className="rounded-2xl border border-border bg-card p-5 shadow-float">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-gold-deep">
                  {t("sidebarCtaTitle")}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {t("sidebarCtaBody")}
                </p>
                <Link
                  href="/booking"
                  className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-gold-gradient text-sm font-bold text-ink shadow-gold transition-all hover:brightness-110"
                >
                  {t("bookCta")}
                  <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
                </Link>
                {transferHref && (
                  <Link
                    href={transferHref}
                    className="mt-3 flex h-11 w-full items-center justify-center rounded-full border border-border text-sm font-semibold text-foreground transition-colors hover:border-gold/40 hover:text-gold-deep"
                  >
                    {t("transferCta")}
                  </Link>
                )}
              </div>
            </aside>
          </div>
        </Container>
      </article>
    </>
  );
}

function formatBlogDate(isoDate: string, locale: string): string {
  const date = new Date(`${isoDate}T12:00:00`);

  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}
