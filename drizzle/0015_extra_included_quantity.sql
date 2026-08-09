ALTER TABLE "extra_services" ADD COLUMN "included_quantity" integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
ALTER TABLE "extra_services" ADD CONSTRAINT "extra_services_included_quantity_non_negative" CHECK ("included_quantity" >= 0);
