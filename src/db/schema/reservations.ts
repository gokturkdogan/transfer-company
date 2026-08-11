import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";
import { uuid } from "drizzle-orm/pg-core";

import {
  currency,
  id,
  sortOrder,
  timestamps,
} from "./columns";
import { reservationItemTypeEnum, reservationStatusEnum, tripTypeEnum } from "./enums";
import { customers } from "./customers";
import { extraServices } from "./extras";
import { locations } from "./locations";
import { routes } from "./routes";
import { vehicleCategories } from "./vehicles";

export const reservations = pgTable(
  "reservations",
  {
    id: id(),
    reference: varchar("reference", { length: 32 }).notNull(),
    status: reservationStatusEnum("status").notNull().default("PENDING"),
    tripType: tripTypeEnum("trip_type").notNull(),
    customerId: uuid("customer_id")
      .notNull()
      .references(() => customers.id),
    pickupLocationId: uuid("pickup_location_id")
      .notNull()
      .references(() => locations.id),
    dropoffLocationId: uuid("dropoff_location_id")
      .notNull()
      .references(() => locations.id),
    routeId: uuid("route_id")
      .notNull()
      .references(() => routes.id),
    outboundAt: timestamp("outbound_at", {
      withTimezone: true,
      mode: "date",
    }).notNull(),
    returnAt: timestamp("return_at", {
      withTimezone: true,
      mode: "date",
    }),
    outboundFlightNumber: varchar("outbound_flight_number", { length: 16 }),
    returnFlightNumber: varchar("return_flight_number", { length: 16 }),
    passengerCount: integer("passenger_count").notNull(),
    largeLuggageCount: integer("large_luggage_count").notNull(),
    cabinLuggageCount: integer("cabin_luggage_count").notNull().default(0),
    snapshotRouteLabel: varchar("snapshot_route_label", { length: 500 }).notNull(),
    hotelLocationId: uuid("hotel_location_id").references(() => locations.id),
    customDestinationName: varchar("custom_destination_name", { length: 255 }),
    customDestinationAddress: text("custom_destination_address"),
    snapshotDropoffLabel: varchar("snapshot_dropoff_label", { length: 500 }),
    subtotalMinor: integer("subtotal_minor").notNull(),
    totalMinor: integer("total_minor").notNull(),
    currency: currency(),
    notes: text("notes"),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("reservations_reference_unique").on(table.reference),
    index("reservations_status_outbound_idx").on(table.status, table.outboundAt),
    index("reservations_customer_id_idx").on(table.customerId),
    index("reservations_hotel_location_id_idx").on(table.hotelLocationId),
    check(
      "reservations_passenger_count_positive",
      sql`${table.passengerCount} > 0`,
    ),
    check(
      "reservations_luggage_non_negative",
      sql`${table.largeLuggageCount} >= 0 AND ${table.cabinLuggageCount} >= 0`,
    ),
    check(
      "reservations_round_trip_return_required",
      sql`${table.tripType} <> 'ROUND_TRIP' OR ${table.returnAt} IS NOT NULL`,
    ),
    check(
      "reservations_return_after_outbound",
      sql`${table.returnAt} IS NULL OR ${table.returnAt} > ${table.outboundAt}`,
    ),
  ],
);

export const reservationItems = pgTable(
  "reservation_items",
  {
    id: id(),
    reservationId: uuid("reservation_id")
      .notNull()
      .references(() => reservations.id, { onDelete: "cascade" }),
    itemType: reservationItemTypeEnum("item_type").notNull(),
    vehicleCategoryId: uuid("vehicle_category_id").references(
      () => vehicleCategories.id,
    ),
    extraServiceId: uuid("extra_service_id").references(() => extraServices.id),
    snapshotName: varchar("snapshot_name", { length: 255 }).notNull(),
    quantity: integer("quantity").notNull(),
    unitPriceMinor: integer("unit_price_minor").notNull(),
    totalPriceMinor: integer("total_price_minor").notNull(),
    currency: currency(),
    sortOrder: sortOrder(),
    ...timestamps,
  },
  (table) => [
    index("reservation_items_reservation_id_idx").on(table.reservationId),
    check(
      "reservation_items_quantity_positive",
      sql`${table.quantity} > 0`,
    ),
    // Allows included free units on PER_UNIT extras:
    // total = unit × billableQty where billableQty ≤ quantity
    // (e.g. 3 child seats, 1 included → unit 500, qty 3, total 1000).
    check(
      "reservation_items_total_consistent_with_unit_quantity",
      sql`${table.totalPriceMinor} >= 0
        AND ${table.totalPriceMinor} <= ${table.unitPriceMinor} * ${table.quantity}
        AND (
          ${table.unitPriceMinor} = 0
          OR ${table.totalPriceMinor} % ${table.unitPriceMinor} = 0
        )`,
    ),
    check(
      "reservation_items_transfer_vehicle_ref",
      sql`(${table.itemType} = 'TRANSFER_VEHICLE' AND ${table.vehicleCategoryId} IS NOT NULL AND ${table.extraServiceId} IS NULL) OR (${table.itemType} = 'EXTRA_SERVICE' AND ${table.extraServiceId} IS NOT NULL AND ${table.vehicleCategoryId} IS NULL)`,
    ),
  ],
);
