CREATE TABLE IF NOT EXISTS "blog_posts" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "slug" varchar(120) NOT NULL,
  "published_at" date NOT NULL,
  "cover_image_url" text DEFAULT '' NOT NULL,
  "transfer_district_code" varchar(32),
  "sort_order" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL,
  "deleted_at" timestamp with time zone
);

CREATE UNIQUE INDEX IF NOT EXISTS "blog_posts_slug_unique" ON "blog_posts" ("slug");
CREATE INDEX IF NOT EXISTS "blog_posts_active_sort_idx"
  ON "blog_posts" ("is_active", "sort_order", "published_at");

CREATE TABLE IF NOT EXISTS "blog_post_translations" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "post_id" uuid NOT NULL REFERENCES "blog_posts"("id") ON DELETE CASCADE,
  "locale" varchar(5) NOT NULL,
  "title" varchar(200) NOT NULL,
  "meta_description" varchar(320) NOT NULL,
  "excerpt" text NOT NULL,
  "reading_minutes" integer DEFAULT 5 NOT NULL,
  "intro" text NOT NULL,
  "pull_quote" text,
  "cover_image_alt" varchar(255) NOT NULL,
  "sections" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "tips" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "faq" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "blog_post_translations_post_locale_unique"
  ON "blog_post_translations" ("post_id", "locale");
CREATE INDEX IF NOT EXISTS "blog_post_translations_locale_idx"
  ON "blog_post_translations" ("locale");
