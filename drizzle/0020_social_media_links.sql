DO $$ BEGIN
  CREATE TYPE "public"."social_media_platform" AS ENUM('INSTAGRAM', 'FACEBOOK', 'X', 'YOUTUBE', 'TIKTOK');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "social_media_links" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "platform" "social_media_platform" NOT NULL,
  "url" varchar(512) DEFAULT '' NOT NULL,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL,
  "deleted_at" timestamp with time zone
);

CREATE UNIQUE INDEX IF NOT EXISTS "social_media_links_platform_unique"
  ON "social_media_links" ("platform");
