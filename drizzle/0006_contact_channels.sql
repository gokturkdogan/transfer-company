DO $$ BEGIN
  CREATE TYPE "public"."contact_channel_type" AS ENUM('EMAIL', 'PHONE', 'WHATSAPP');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "contact_channels" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "type" "contact_channel_type" NOT NULL,
  "value" varchar(255) NOT NULL,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL,
  "deleted_at" timestamp with time zone
);

CREATE INDEX IF NOT EXISTS "contact_channels_type_active_sort_idx"
  ON "contact_channels" ("type", "is_active", "sort_order");
