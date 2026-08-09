CREATE TABLE IF NOT EXISTS "vehicle_display_prices" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "vehicle_category_id" uuid NOT NULL,
  "currency" char(3) NOT NULL,
  "starting_from_minor" integer NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "vehicle_display_prices_vehicle_category_id_vehicle_categories_id_fk" FOREIGN KEY ("vehicle_category_id") REFERENCES "vehicle_categories"("id") ON DELETE cascade ON UPDATE no action,
  CONSTRAINT "vehicle_display_prices_non_negative" CHECK ("starting_from_minor" >= 0)
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "vehicle_display_prices_vehicle_currency_unique" ON "vehicle_display_prices" USING btree ("vehicle_category_id","currency");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "vehicle_display_prices_vehicle_category_id_idx" ON "vehicle_display_prices" USING btree ("vehicle_category_id");
