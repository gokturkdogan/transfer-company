import { getTranslations } from "next-intl/server";

import { clientEnv } from "@/config/env";
import type { BlogLocaleContent, BlogPostDefinition } from "@/content/blog/types";

type BlogArticleJsonLdProps = {
  locale: string;
  post: BlogPostDefinition;
  content: BlogLocaleContent;
};

export async function BlogArticleJsonLd({
  locale,
  post,
  content,
}: BlogArticleJsonLdProps) {
  const [common, blogHub] = await Promise.all([
    getTranslations("common"),
    getTranslations("blog.hub"),
  ]);

  const baseUrl = clientEnv.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  const homeUrl = `${baseUrl}/${locale}`;
  const blogHubUrl = `${baseUrl}/${locale}/blog`;
  const articleUrl = `${baseUrl}/${locale}/blog/${post.slug}`;

  const graph = [
    {
      "@type": "Article",
      "@id": `${articleUrl}#article`,
      headline: content.title,
      description: content.metaDescription,
      image: post.coverImage,
      datePublished: post.publishedAt,
      dateModified: post.publishedAt,
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": articleUrl,
      },
      author: {
        "@type": "Organization",
        name: common("appName"),
        url: baseUrl,
      },
      publisher: {
        "@type": "Organization",
        name: common("appName"),
        url: baseUrl,
      },
      inLanguage: locale,
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${articleUrl}#breadcrumb`,
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: common("appName"),
          item: homeUrl,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: blogHub("metaTitle"),
          item: blogHubUrl,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: content.title,
          item: articleUrl,
        },
      ],
    },
  ];

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({ "@context": "https://schema.org", "@graph": graph }),
      }}
    />
  );
}
