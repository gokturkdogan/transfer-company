ALTER TABLE "locations"
  ADD COLUMN IF NOT EXISTS "image_key" varchar(512),
  ADD COLUMN IF NOT EXISTS "is_featured_on_homepage" boolean DEFAULT false NOT NULL;

CREATE TABLE IF NOT EXISTS "location_featured_prices" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "location_id" uuid NOT NULL REFERENCES "locations"("id") ON DELETE CASCADE,
  "currency" char(3) NOT NULL,
  "starting_from_minor" integer NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "location_featured_prices_location_currency_unique"
  ON "location_featured_prices" ("location_id", "currency");

CREATE INDEX IF NOT EXISTS "locations_featured_homepage_idx"
  ON "locations" ("is_featured_on_homepage", "sort_order")
  WHERE "type" = 'DISTRICT' AND "is_active" = true;
