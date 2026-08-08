CREATE TABLE IF NOT EXISTS "vehicle_category_features" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "vehicle_category_id" uuid NOT NULL,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "vehicle_category_feature_translations" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "feature_id" uuid NOT NULL,
  "locale" varchar(5) NOT NULL,
  "label" varchar(255) NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE "vehicle_category_features"
  ADD CONSTRAINT "vehicle_category_features_vehicle_category_id_vehicle_categories_id_fk"
  FOREIGN KEY ("vehicle_category_id")
  REFERENCES "public"."vehicle_categories"("id")
  ON DELETE cascade
  ON UPDATE no action;

ALTER TABLE "vehicle_category_feature_translations"
  ADD CONSTRAINT "vehicle_category_feature_translations_feature_id_vehicle_category_features_id_fk"
  FOREIGN KEY ("feature_id")
  REFERENCES "public"."vehicle_category_features"("id")
  ON DELETE cascade
  ON UPDATE no action;

CREATE INDEX IF NOT EXISTS "vehicle_category_features_category_sort_idx"
  ON "vehicle_category_features" ("vehicle_category_id", "sort_order");

CREATE UNIQUE INDEX IF NOT EXISTS "vehicle_category_feature_translations_feature_locale_unique"
  ON "vehicle_category_feature_translations" ("feature_id", "locale");

CREATE INDEX IF NOT EXISTS "vehicle_category_feature_translations_locale_idx"
  ON "vehicle_category_feature_translations" ("locale");

ALTER TABLE "vehicle_categories"
  DROP COLUMN IF EXISTS "has_tv",
  DROP COLUMN IF EXISTS "has_wifi";
