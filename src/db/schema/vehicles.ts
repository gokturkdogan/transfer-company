import { index, integer, pgTable, uniqueIndex, varchar } from "drizzle-orm/pg-core";
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
    passengerCapacity: integer("passenger_capacity").notNull(),
    largeLuggageCapacity: integer("large_luggage_capacity").notNull(),
    cabinLuggageCapacity: integer("cabin_luggage_capacity").notNull(),
    imageKey: varchar("image_key", { length: 255 }),
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
