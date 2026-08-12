import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";

import { BlogHubHero } from "@/components/blog/BlogHubHero";
import { BlogArticleCard } from "@/components/blog/BlogArticleCard";
import { Container } from "@/components/layout/Container";
import { MobileContactBar } from "@/components/shared/MobileContactBar";
import { SiteFooter } from "@/components/shared/SiteFooter";
import { SiteHeader } from "@/components/shared/SiteHeader";
import { listBlogSummaries } from "@/content/blog/registry";
import { getCachedEnabledLocales } from "@/server/cache/public-catalog";
import { buildBlogHubMetadata } from "@/features/blog/lib/blog-metadata";

export const revalidate = 120;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const enabledLocales = await getCachedEnabledLocales();

  return buildBlogHubMetadata(locale, enabledLocales.map((item) => item.code));
}

export default async function BlogHubPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [articles, enabledLocales] = await Promise.all([
    listBlogSummaries(locale),
    getCachedEnabledLocales(),
  ]);

  return (
    <>
      <SiteHeader enabledLocales={enabledLocales} />
      <main className="flex flex-1 flex-col pb-20 md:pb-0">
        <BlogHubHero />
        <section className="py-12 md:py-16">
          <Container>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {articles.map((article, index) => (
                <BlogArticleCard
                  key={article.slug}
                  article={article}
                  priority={index < 2}
                />
              ))}
            </div>
          </Container>
        </section>
      </main>
      <SiteFooter enabledLocales={enabledLocales} />
      <MobileContactBar />
    </>
  );
}
