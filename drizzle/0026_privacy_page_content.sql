-- Simplify privacy page to single HTML content field per locale
ALTER TABLE "privacy_page_translations" DROP COLUMN IF EXISTS "meta_title";
ALTER TABLE "privacy_page_translations" DROP COLUMN IF EXISTS "meta_description";
ALTER TABLE "privacy_page_translations" DROP COLUMN IF EXISTS "hero_badge";
ALTER TABLE "privacy_page_translations" DROP COLUMN IF EXISTS "hero_title";
ALTER TABLE "privacy_page_translations" DROP COLUMN IF EXISTS "hero_title_accent";
ALTER TABLE "privacy_page_translations" DROP COLUMN IF EXISTS "hero_subtitle";
ALTER TABLE "privacy_page_translations" DROP COLUMN IF EXISTS "hero_updated";
ALTER TABLE "privacy_page_translations" DROP COLUMN IF EXISTS "hero_highlight_essential";
ALTER TABLE "privacy_page_translations" DROP COLUMN IF EXISTS "hero_highlight_no_tracking";
ALTER TABLE "privacy_page_translations" DROP COLUMN IF EXISTS "sections";

ALTER TABLE "privacy_page_translations" ADD COLUMN IF NOT EXISTS "content" text DEFAULT '' NOT NULL;
