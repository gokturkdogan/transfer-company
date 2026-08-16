import { relations } from "drizzle-orm";
import {
  date,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { localeColumn, sortOrder, softDelete, timestamps } from "./columns";
import { id } from "./columns";

export const blogPosts = pgTable(
  "blog_posts",
  {
    id: id(),
    slug: varchar("slug", { length: 120 }).notNull(),
    publishedAt: date("published_at", { mode: "string" }).notNull(),
    coverImageUrl: text("cover_image_url").notNull().default(""),
    transferDistrictCode: varchar("transfer_district_code", { length: 32 }),
    sortOrder: sortOrder(),
    ...timestamps,
    ...softDelete,
  },
  (table) => [
    uniqueIndex("blog_posts_slug_unique").on(table.slug),
    index("blog_posts_active_sort_idx").on(
      table.isActive,
      table.sortOrder,
      table.publishedAt,
    ),
  ],
);

export const blogPostTranslations = pgTable(
  "blog_post_translations",
  {
    id: id(),
    postId: uuid("post_id")
      .notNull()
      .references(() => blogPosts.id, { onDelete: "cascade" }),
    locale: localeColumn(),
    title: varchar("title", { length: 200 }).notNull(),
    metaDescription: varchar("meta_description", { length: 320 }).notNull(),
    excerpt: text("excerpt").notNull(),
    readingMinutes: integer("reading_minutes").notNull().default(5),
    intro: text("intro").notNull(),
    pullQuote: text("pull_quote"),
    coverImageAlt: varchar("cover_image_alt", { length: 255 }).notNull(),
    sections: jsonb("sections").notNull().default([]),
    tips: jsonb("tips").notNull().default([]),
    faq: jsonb("faq").notNull().default([]),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("blog_post_translations_post_locale_unique").on(
      table.postId,
      table.locale,
    ),
    index("blog_post_translations_locale_idx").on(table.locale),
  ],
);

export const blogPostsRelations = relations(blogPosts, ({ many }) => ({
  translations: many(blogPostTranslations),
}));

export const blogPostTranslationsRelations = relations(
  blogPostTranslations,
  ({ one }) => ({
    post: one(blogPosts, {
      fields: [blogPostTranslations.postId],
      references: [blogPosts.id],
    }),
  }),
);
