CREATE TABLE IF NOT EXISTS "footer_settings" (
  "id" varchar(32) PRIMARY KEY NOT NULL DEFAULT 'default',
  "tursab_license_number" varchar(64) DEFAULT '' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "footer_settings_singleton_id" CHECK ("id" = 'default')
);

INSERT INTO "footer_settings" ("id", "tursab_license_number")
VALUES ('default', '')
ON CONFLICT ("id") DO NOTHING;
