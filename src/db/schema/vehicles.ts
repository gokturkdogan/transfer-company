import { boolean, char, check, index, integer, pgTable, uniqueIndex, varchar } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { uuid } from "drizzle-orm/pg-core";

import {
  id,
  localeColumn,
  softDelete,
  sortOrder,
  timestamps,
} from "./columns";

export const vehicleCategories = pgTable(
  "vehicle_categories",
  {
    id: id(),
    code: varchar("code", { length: 32 }).notNull(),
    defaultName: varchar("default_name", { length: 255 }).notNull(),
    brand: varchar("brand", { length: 100 }).notNull().default(""),
    model: varchar("model", { length: 100 }).notNull().default(""),
    passengerCapacity: integer("passenger_capacity").notNull(),
    largeLuggageCapacity: integer("large_luggage_capacity").notNull(),
    cabinLuggageCapacity: integer("cabin_luggage_capacity").notNull(),
    imageKey: varchar("image_key", { length: 512 }),
    coverInBookingPreview: boolean("cover_in_booking_preview")
      .notNull()
      .default(false),
    sortOrder: sortOrder(),
    ...timestamps,
    ...softDelete,
  },
  (table) => [
    uniqueIndex("vehicle_categories_code_unique").on(table.code),
    index("vehicle_categories_active_sort_idx").on(
      table.isActive,
      table.sortOrder,
    ),
  ],
);

export const vehicleDisplayPrices = pgTable(
  "vehicle_display_prices",
  {
    id: id(),
    vehicleCategoryId: uuid("vehicle_category_id")
      .notNull()
      .references(() => vehicleCategories.id, { onDelete: "cascade" }),
    currency: char("currency", { length: 3 }).notNull(),
    startingFromMinor: integer("starting_from_minor").notNull(),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("vehicle_display_prices_vehicle_currency_unique").on(
      table.vehicleCategoryId,
      table.currency,
    ),
    index("vehicle_display_prices_vehicle_category_id_idx").on(
      table.vehicleCategoryId,
    ),
    check(
      "vehicle_display_prices_non_negative",
      sql`${table.startingFromMinor} >= 0`,
    ),
  ],
);

export const vehicleCategoryFeatures = pgTable(
  "vehicle_category_features",
  {
    id: id(),
    vehicleCategoryId: uuid("vehicle_category_id")
      .notNull()
      .references(() => vehicleCategories.id, { onDelete: "cascade" }),
    sortOrder: sortOrder(),
    ...timestamps,
  },
  (table) => [
    index("vehicle_category_features_category_sort_idx").on(
      table.vehicleCategoryId,
      table.sortOrder,
    ),
  ],
);

export const vehicleCategoryFeatureTranslations = pgTable(
  "vehicle_category_feature_translations",
  {
    id: id(),
    featureId: uuid("feature_id")
      .notNull()
      .references(() => vehicleCategoryFeatures.id, { onDelete: "cascade" }),
    locale: localeColumn(),
    label: varchar("label", { length: 255 }).notNull(),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("vehicle_category_feature_translations_feature_locale_unique").on(
      table.featureId,
      table.locale,
    ),
    index("vehicle_category_feature_translations_locale_idx").on(table.locale),
  ],
);

export const vehicleCategoryImages = pgTable(
  "vehicle_category_images",
  {
    id: id(),
    vehicleCategoryId: uuid("vehicle_category_id")
      .notNull()
      .references(() => vehicleCategories.id, { onDelete: "cascade" }),
    imageKey: varchar("image_key", { length: 512 }).notNull(),
    isBookingPreview: boolean("is_booking_preview").notNull().default(false),
    sortOrder: sortOrder(),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("vehicle_category_images_category_sort_unique").on(
      table.vehicleCategoryId,
      table.sortOrder,
    ),
    index("vehicle_category_images_category_id_idx").on(table.vehicleCategoryId),
  ],
);

export const vehicleCategoryTranslations = pgTable(
  "vehicle_category_translations",
  {
    id: id(),
    vehicleCategoryId: uuid("vehicle_category_id")
      .notNull()
      .references(() => vehicleCategories.id, { onDelete: "cascade" }),
    locale: localeColumn(),
    name: varchar("name", { length: 255 }).notNull(),
    shortDescription: varchar("short_description", { length: 500 }),
    description: varchar("description", { length: 1000 }),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("vehicle_category_translations_category_locale_unique").on(
      table.vehicleCategoryId,
      table.locale,
    ),
    index("vehicle_category_translations_locale_idx").on(table.locale),
  ],
);
