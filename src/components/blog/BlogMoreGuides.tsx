import { ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { BlogArticleCard } from "@/components/blog/BlogArticleCard";
import { Container } from "@/components/layout/Container";
import type { BlogPostSummary } from "@/content/blog/types";
import { Link } from "@/i18n/navigation";

type BlogMoreGuidesProps = {
  articles: BlogPostSummary[];
  currentSlug?: string;
};

export async function BlogMoreGuides({
  articles,
  currentSlug,
}: BlogMoreGuidesProps) {
  const t = await getTranslations("blog");
  const items = articles.filter((article) => article.slug !== currentSlug);

  if (items.length === 0) {
    return null;
  }

  return (
    <section className="border-t border-border/60 bg-muted/25 py-14 md:py-20">
      <Container>
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {t("moreGuidesTitle")}
            </h2>
            <p className="text-sm text-muted-foreground sm:text-base">
              {t("moreGuidesSubtitle")}
            </p>
          </div>
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-gold-deep transition-colors hover:text-gold"
          >
            {t("allGuides")}
            <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.slice(0, 3).map((article, index) => (
            <BlogArticleCard
              key={article.slug}
              article={article}
              priority={index === 0}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}
