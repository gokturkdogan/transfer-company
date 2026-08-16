import { count } from "drizzle-orm";
import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";

import { antalyaArrivalGuidePost } from "../src/content/blog/posts/antalya-havalimani-varis-rehberi";
import { transferPricingGuidePost } from "../src/content/blog/posts/antalya-transfer-fiyatlari";
import { belekTransferGuidePost } from "../src/content/blog/posts/belek-havalimani-transferi";
import type { BlogPostDefinition } from "../src/content/blog/types";
import * as schema from "../src/db/schema";
import type { BlogLocaleContent } from "../src/content/blog/types";

const BLOG_POSTS: BlogPostDefinition[] = [
  antalyaArrivalGuidePost,
  transferPricingGuidePost,
  belekTransferGuidePost,
];

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ??
    "postgresql://placeholder:placeholder@localhost/placeholder?sslmode=require",
});
const db = drizzle(pool, { schema });


async function main() {
  const [rowCount] = await db.select({ value: count() }).from(schema.blogPosts);

  if (rowCount.value > 0) {
    console.log(`Skipping seed: ${rowCount.value} blog post(s) already exist.`);
    return;
  }

  for (const [index, post] of BLOG_POSTS.entries()) {
    const [created] = await db
      .insert(schema.blogPosts)
      .values({
        slug: post.slug,
        publishedAt: post.publishedAt,
        coverImageUrl: post.coverImage,
        transferDistrictCode: post.transferDistrictCode ?? null,
        sortOrder: index,
        isActive: true,
      })
      .returning({ id: schema.blogPosts.id });

    const locales = Object.keys(post.content);

    for (const locale of locales) {
      const content = post.content[locale] as BlogLocaleContent | undefined;
      if (!content) {
        continue;
      }

      await db.insert(schema.blogPostTranslations).values({
        postId: created.id,
        locale,
        title: content.title,
        metaDescription: content.metaDescription,
        excerpt: content.excerpt,
        readingMinutes: content.readingMinutes,
        intro: content.intro,
        pullQuote: content.pullQuote ?? null,
        coverImageAlt: post.coverImageAlt[locale as "tr" | "en"] ?? content.title,
        sections: content.sections,
        tips: content.tips ?? [],
        faq: content.faq ?? [],
      });
    }
  }

  console.log(`Seeded ${BLOG_POSTS.length} blog guides.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
  });
