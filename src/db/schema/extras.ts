import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  pgTable,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";
import { uuid } from "drizzle-orm/pg-core";

import {
  currency,
  id,
  localeColumn,
  priceMinor,
  softDelete,
  sortOrder,
  timestamps,
} from "./columns";
import { extraPricingModeEnum } from "./enums";

export const extraServices = pgTable(
  "extra_services",
  {
    id: id(),
    code: varchar("code", { length: 32 }).notNull(),
    pricingMode: extraPricingModeEnum("pricing_mode").notNull(),
    priceMinor: priceMinor(),
    currency: currency(),
    customerSelectable: boolean("customer_selectable").notNull().default(true),
    autoSuggested: boolean("auto_suggested").notNull().default(false),
    minQuantity: integer("min_quantity").notNull().default(1),
    maxQuantity: integer("max_quantity"),
    luggageCapacityPerUnit: integer("luggage_capacity_per_unit"),
    sortOrder: sortOrder(),
    ...timestamps,
    ...softDelete,
  },
  (table) => [
    uniqueIndex("extra_services_code_unique").on(table.code),
    index("extra_services_active_sort_idx").on(table.isActive, table.sortOrder),
    check(
      "extra_services_price_non_negative",
      sql`${table.priceMinor} >= 0`,
    ),
    check(
      "extra_services_quantity_bounds",
      sql`${table.maxQuantity} IS NULL OR ${table.maxQuantity} >= ${table.minQuantity}`,
    ),
    check(
      "extra_services_luggage_capacity_positive",
      sql`${table.luggageCapacityPerUnit} IS NULL OR ${table.luggageCapacityPerUnit} > 0`,
    ),
  ],
);

export const extraServiceTranslations = pgTable(
  "extra_service_translations",
  {
    id: id(),
    extraServiceId: uuid("extra_service_id")
      .notNull()
      .references(() => extraServices.id, { onDelete: "cascade" }),
    locale: localeColumn(),
    name: varchar("name", { length: 255 }).notNull(),
    description: varchar("description", { length: 1000 }),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("extra_service_translations_service_locale_unique").on(
      table.extraServiceId,
      table.locale,
    ),
    index("extra_service_translations_locale_idx").on(table.locale),
  ],
);
