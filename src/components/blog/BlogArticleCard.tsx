import { ArrowRight, Calendar, Clock } from "lucide-react";
import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";

import type { BlogPostSummary } from "@/content/blog/types";
import { Link } from "@/i18n/navigation";

type BlogArticleCardProps = {
  article: BlogPostSummary;
  priority?: boolean;
};

export async function BlogArticleCard({
  article,
  priority = false,
}: BlogArticleCardProps) {
  const t = await getTranslations("blog");
  const locale = await getLocale();

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-border/80 bg-card shadow-float transition-all duration-300 hover:-translate-y-1 hover:border-gold/35 hover:shadow-premium">
      <Link
        href={`/blog/${article.slug}`}
        className="relative block aspect-[16/10] overflow-hidden bg-ink"
      >
        <Image
          src={article.coverImage}
          alt={article.coverImageAlt}
          fill
          priority={priority}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 flex items-center gap-3 px-4 pb-4 text-xs text-white/80">
          <span className="inline-flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5 text-gold" aria-hidden />
            {t("published", {
              date: formatBlogDate(article.publishedAt, locale),
            })}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-gold" aria-hidden />
            {t("readingTime", { minutes: article.readingMinutes })}
          </span>
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-5 sm:p-6">
        <h2 className="text-lg font-bold leading-snug tracking-tight text-foreground sm:text-xl">
          <Link
            href={`/blog/${article.slug}`}
            className="transition-colors hover:text-gold-deep"
          >
            {article.title}
          </Link>
        </h2>
        <p className="flex-1 text-sm leading-relaxed text-muted-foreground">
          {article.excerpt}
        </p>
        <Link
          href={`/blog/${article.slug}`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-gold-deep transition-colors hover:text-gold"
        >
          {t("readMore")}
          <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
        </Link>
      </div>
    </article>
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
