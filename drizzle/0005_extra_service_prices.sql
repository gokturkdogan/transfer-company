CREATE TABLE IF NOT EXISTS "extra_service_prices" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "extra_service_id" uuid NOT NULL,
  "currency" char(3) NOT NULL,
  "price_minor" integer NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL,
  "deleted_at" timestamp with time zone,
  CONSTRAINT "extra_service_prices_price_non_negative" CHECK ("price_minor" >= 0)
);

ALTER TABLE "extra_service_prices"
  ADD CONSTRAINT "extra_service_prices_extra_service_id_extra_services_id_fk"
  FOREIGN KEY ("extra_service_id")
  REFERENCES "public"."extra_services"("id")
  ON DELETE cascade
  ON UPDATE no action;

CREATE UNIQUE INDEX IF NOT EXISTS "extra_service_prices_extra_currency_unique"
  ON "extra_service_prices" ("extra_service_id", "currency");
