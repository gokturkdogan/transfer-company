DELETE FROM "extra_service_prices" WHERE "currency" = 'CHF';
--> statement-breakpoint
DELETE FROM "route_prices" WHERE "currency" = 'CHF';
--> statement-breakpoint
DELETE FROM "enabled_currencies" WHERE "code" = 'CHF';
