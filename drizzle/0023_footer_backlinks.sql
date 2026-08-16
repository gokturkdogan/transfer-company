CREATE TABLE IF NOT EXISTS "footer_backlinks" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "slot_index" integer NOT NULL,
  "label" varchar(120) DEFAULT '' NOT NULL,
  "url" varchar(512) DEFAULT '' NOT NULL,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL,
  "deleted_at" timestamp with time zone,
  CONSTRAINT "footer_backlinks_slot_index_range" CHECK ("slot_index" >= 0 AND "slot_index" <= 2)
);

CREATE UNIQUE INDEX IF NOT EXISTS "footer_backlinks_slot_unique"
  ON "footer_backlinks" ("slot_index");
