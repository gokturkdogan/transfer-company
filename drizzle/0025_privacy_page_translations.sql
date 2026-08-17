CREATE TABLE IF NOT EXISTS "privacy_page_translations" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "locale" varchar(5) NOT NULL,
  "meta_title" varchar(200) NOT NULL,
  "meta_description" varchar(320) NOT NULL,
  "hero_badge" varchar(120) NOT NULL,
  "hero_title" varchar(200) NOT NULL,
  "hero_title_accent" varchar(200) NOT NULL,
  "hero_subtitle" text NOT NULL,
  "hero_updated" varchar(120) NOT NULL,
  "hero_highlight_essential" varchar(120) NOT NULL,
  "hero_highlight_no_tracking" varchar(120) NOT NULL,
  "sections" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "privacy_page_translations_locale_unique"
  ON "privacy_page_translations" ("locale");

CREATE INDEX IF NOT EXISTS "privacy_page_translations_locale_idx"
  ON "privacy_page_translations" ("locale");
