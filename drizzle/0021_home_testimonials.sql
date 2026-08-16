CREATE TABLE IF NOT EXISTS "home_testimonials" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "locale" varchar(5) NOT NULL,
  "slot_index" integer NOT NULL,
  "first_name" varchar(64) DEFAULT '' NOT NULL,
  "last_name" varchar(64) DEFAULT '' NOT NULL,
  "quote" text DEFAULT '' NOT NULL,
  "rating" integer DEFAULT 5 NOT NULL,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL,
  "deleted_at" timestamp with time zone,
  CONSTRAINT "home_testimonials_rating_range" CHECK ("rating" >= 1 AND "rating" <= 5),
  CONSTRAINT "home_testimonials_slot_index_range" CHECK ("slot_index" >= 0 AND "slot_index" <= 2)
);

CREATE UNIQUE INDEX IF NOT EXISTS "home_testimonials_locale_slot_unique"
  ON "home_testimonials" ("locale", "slot_index");

CREATE INDEX IF NOT EXISTS "home_testimonials_locale_active_sort_idx"
  ON "home_testimonials" ("locale", "is_active", "sort_order");
