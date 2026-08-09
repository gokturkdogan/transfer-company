DELETE FROM "extra_service_prices" WHERE "currency" <> 'EUR';
--> statement-breakpoint
DELETE FROM "route_prices" WHERE "currency" <> 'EUR';
--> statement-breakpoint
DELETE FROM "location_featured_prices" WHERE "currency" <> 'EUR';
--> statement-breakpoint
DELETE FROM "enabled_currencies" WHERE "code" <> 'EUR';
--> statement-breakpoint
INSERT INTO "enabled_currencies" ("code", "label", "sort_order")
VALUES ('EUR', 'Euro (EUR)', 0)
ON CONFLICT ("code") DO UPDATE SET
  "label" = EXCLUDED."label",
  "sort_order" = EXCLUDED."sort_order";
