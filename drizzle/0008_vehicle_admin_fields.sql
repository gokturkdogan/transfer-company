ALTER TABLE "vehicle_categories"
  ADD COLUMN IF NOT EXISTS "brand" varchar(100) DEFAULT '' NOT NULL,
  ADD COLUMN IF NOT EXISTS "model" varchar(100) DEFAULT '' NOT NULL,
  ADD COLUMN IF NOT EXISTS "has_tv" boolean DEFAULT false NOT NULL,
  ADD COLUMN IF NOT EXISTS "has_wifi" boolean DEFAULT false NOT NULL;

UPDATE "vehicle_categories"
SET
  "brand" = split_part("default_name", ' ', 1),
  "model" = CASE
    WHEN position(' ' in "default_name") > 0
      THEN substring("default_name" from position(' ' in "default_name") + 1)
    ELSE ''
  END
WHERE "brand" = '';

CREATE TABLE IF NOT EXISTS "vehicle_category_images" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "vehicle_category_id" uuid NOT NULL,
  "image_key" varchar(255) NOT NULL,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE "vehicle_category_images"
  ADD CONSTRAINT "vehicle_category_images_vehicle_category_id_vehicle_categories_id_fk"
  FOREIGN KEY ("vehicle_category_id")
  REFERENCES "public"."vehicle_categories"("id")
  ON DELETE cascade
  ON UPDATE no action;

CREATE UNIQUE INDEX IF NOT EXISTS "vehicle_category_images_category_sort_unique"
  ON "vehicle_category_images" ("vehicle_category_id", "sort_order");

CREATE INDEX IF NOT EXISTS "vehicle_category_images_category_id_idx"
  ON "vehicle_category_images" ("vehicle_category_id");
