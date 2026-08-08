CREATE TABLE IF NOT EXISTS "enabled_locales" (
  "code" varchar(5) PRIMARY KEY NOT NULL,
  "label" varchar(64) NOT NULL,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "enabled_locales_active_sort_idx"
  ON "enabled_locales" ("is_active", "sort_order");

INSERT INTO "enabled_locales" ("code", "label", "sort_order", "is_active")
VALUES
  ('tr', 'Türkçe', 0, true),
  ('en', 'English', 1, true),
  ('de', 'Deutsch', 2, true),
  ('ru', 'Русский', 3, true),
  ('ar', 'العربية', 4, true)
ON CONFLICT ("code") DO NOTHING;
