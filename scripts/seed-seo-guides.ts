import { and, eq } from "drizzle-orm";
import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";

import { SEO_GUIDES } from "./data/seo-guides";
import * as schema from "../src/db/schema";

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ??
    "postgresql://placeholder:placeholder@localhost/placeholder?sslmode=require",
});
const db = drizzle(pool, { schema });

const LOCALES = ["tr", "en", "de", "ru", "ar"] as const;

async function main() {
  let inserted = 0;
  let updated = 0;

  for (const guide of SEO_GUIDES) {
    const [existing] = await db
      .select({ id: schema.blogPosts.id })
      .from(schema.blogPosts)
      .where(eq(schema.blogPosts.slug, guide.slug))
      .limit(1);

    let postId: string;

    if (existing) {
      postId = existing.id;
      await db
        .update(schema.blogPosts)
        .set({
          publishedAt: guide.publishedAt,
          coverImageUrl: guide.coverImageUrl,
          transferDistrictCode: guide.transferDistrictCode ?? null,
          sortOrder: guide.sortOrder,
          isActive: true,
          deletedAt: null,
        })
        .where(eq(schema.blogPosts.id, postId));
      updated += 1;
    } else {
      const [created] = await db
        .insert(schema.blogPosts)
        .values({
          slug: guide.slug,
          publishedAt: guide.publishedAt,
          coverImageUrl: guide.coverImageUrl,
          transferDistrictCode: guide.transferDistrictCode ?? null,
          sortOrder: guide.sortOrder,
          isActive: true,
        })
        .returning({ id: schema.blogPosts.id });

      postId = created.id;
      inserted += 1;
    }

    for (const locale of LOCALES) {
      const translation = guide.translations[locale];

      if (!translation) {
        console.warn(`Missing ${locale} for ${guide.slug}`);
        continue;
      }

      const values = {
        title: translation.title,
        metaDescription: translation.metaDescription,
        excerpt: translation.excerpt,
        readingMinutes: translation.readingMinutes,
        intro: translation.intro,
        pullQuote: translation.pullQuote ?? null,
        coverImageAlt: translation.coverImageAlt,
        sections: translation.sections,
        tips: translation.tips ?? [],
        faq: translation.faq ?? [],
      };

      const [existingTranslation] = await db
        .select({ id: schema.blogPostTranslations.id })
        .from(schema.blogPostTranslations)
        .where(
          and(
            eq(schema.blogPostTranslations.postId, postId),
            eq(schema.blogPostTranslations.locale, locale),
          ),
        )
        .limit(1);

      if (existingTranslation) {
        await db
          .update(schema.blogPostTranslations)
          .set(values)
          .where(eq(schema.blogPostTranslations.id, existingTranslation.id));
      } else {
        await db.insert(schema.blogPostTranslations).values({
          postId,
          locale,
          ...values,
        });
      }
    }
  }

  console.log(
    `SEO guides seeded: ${inserted} new, ${updated} updated (${SEO_GUIDES.length} total).`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
  });
