CREATE TABLE IF NOT EXISTS "enabled_currencies" (
  "code" char(3) PRIMARY KEY NOT NULL,
  "label" varchar(64) NOT NULL,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "enabled_currencies_sort_order_idx"
  ON "enabled_currencies" ("sort_order");

DROP INDEX IF EXISTS "route_prices_route_vehicle_unique";

CREATE UNIQUE INDEX IF NOT EXISTS "route_prices_route_vehicle_currency_unique"
  ON "route_prices" ("route_id", "vehicle_category_id", "currency");

INSERT INTO "enabled_currencies" ("code", "label", "sort_order")
VALUES ('EUR', 'Euro (EUR)', 0)
ON CONFLICT ("code") DO NOTHING;
