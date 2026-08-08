import { sql } from "drizzle-orm";
import { check, index, integer, pgTable, uniqueIndex } from "drizzle-orm/pg-core";
import { uuid } from "drizzle-orm/pg-core";

import {
  currency,
  id,
  softDelete,
  timestamps,
} from "./columns";
import { locations } from "./locations";
import { vehicleCategories } from "./vehicles";

export const routes = pgTable(
  "routes",
  {
    id: id(),
    originLocationId: uuid("origin_location_id")
      .notNull()
      .references(() => locations.id),
    destinationLocationId: uuid("destination_location_id")
      .notNull()
      .references(() => locations.id),
    ...timestamps,
    ...softDelete,
  },
  (table) => [
    uniqueIndex("routes_origin_destination_unique").on(
      table.originLocationId,
      table.destinationLocationId,
    ),
    index("routes_active_idx").on(table.isActive),
    check(
      "routes_origin_not_destination",
      sql`${table.originLocationId} <> ${table.destinationLocationId}`,
    ),
  ],
);

export const routePrices = pgTable(
  "route_prices",
  {
    id: id(),
    routeId: uuid("route_id")
      .notNull()
      .references(() => routes.id),
    vehicleCategoryId: uuid("vehicle_category_id")
      .notNull()
      .references(() => vehicleCategories.id),
    oneWayPriceMinor: integer("one_way_price_minor").notNull(),
    roundTripPriceMinor: integer("round_trip_price_minor"),
    currency: currency(),
    ...timestamps,
    ...softDelete,
  },
  (table) => [
    uniqueIndex("route_prices_route_vehicle_unique").on(
      table.routeId,
      table.vehicleCategoryId,
    ),
    index("route_prices_route_active_idx").on(table.routeId, table.isActive),
    check(
      "route_prices_one_way_non_negative",
      sql`${table.oneWayPriceMinor} >= 0`,
    ),
    check(
      "route_prices_round_trip_non_negative",
      sql`${table.roundTripPriceMinor} IS NULL OR ${table.roundTripPriceMinor} >= 0`,
    ),
  ],
);
