ALTER TABLE "reservation_items" DROP CONSTRAINT "reservation_items_total_equals_unit_times_quantity";
--> statement-breakpoint
ALTER TABLE "reservation_items" ADD CONSTRAINT "reservation_items_total_consistent_with_unit_quantity" CHECK (
  "total_price_minor" >= 0
  AND "total_price_minor" <= "unit_price_minor" * "quantity"
  AND (
    "unit_price_minor" = 0
    OR "total_price_minor" % "unit_price_minor" = 0
  )
);
