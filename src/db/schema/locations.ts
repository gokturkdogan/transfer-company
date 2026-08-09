import { sql } from "drizzle-orm";
import {
  boolean,
  char,
  check,
  doublePrecision,
  index,
  integer,
  pgTable,
  text,
  uniqueIndex,
  uuid,
  varchar,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";

import {
  id,
  localeColumn,
  softDelete,
  sortOrder,
  timestamps,
} from "./columns";
import { locationTypeEnum } from "./enums";

export const regions = pgTable(
  "regions",
  {
    id: id(),
    code: varchar("code", { length: 32 }).notNull(),
    ...timestamps,
    ...softDelete,
  },
  (table) => [
    uniqueIndex("regions_code_unique").on(table.code),
    index("regions_is_active_idx").on(table.isActive),
  ],
);

export const regionTranslations = pgTable(
  "region_translations",
  {
    id: id(),
    regionId: uuid("region_id")
      .notNull()
      .references(() => regions.id, { onDelete: "cascade" }),
    locale: localeColumn(),
    name: varchar("name", { length: 255 }).notNull(),
    description: varchar("description", { length: 1000 }),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("region_translations_region_locale_unique").on(
      table.regionId,
      table.locale,
    ),
    index("region_translations_locale_idx").on(table.locale),
  ],
);

export const locations = pgTable(
  "locations",
  {
    id: id(),
    parentId: uuid("parent_id").references((): AnyPgColumn => locations.id),
    regionId: uuid("region_id").references(() => regions.id),
    type: locationTypeEnum("type").notNull(),
    code: varchar("code", { length: 64 }).notNull(),
    defaultName: varchar("default_name", { length: 255 }).notNull(),
    address: text("address"),
    latitude: doublePrecision("latitude"),
    longitude: doublePrecision("longitude"),
    imageKey: varchar("image_key", { length: 512 }),
    isFeaturedOnHomepage: boolean("is_featured_on_homepage")
      .notNull()
      .default(false),
    sortOrder: sortOrder(),
    ...timestamps,
    ...softDelete,
  },
  (table) => [
    uniqueIndex("locations_code_unique").on(table.code),
    index("locations_parent_id_idx").on(table.parentId),
    index("locations_parent_type_active_idx").on(
      table.parentId,
      table.type,
      table.isActive,
    ),
    index("locations_region_id_idx").on(table.regionId),
    index("locations_type_active_idx").on(table.type, table.isActive),
    check(
      "locations_latitude_bounds",
      sql`${table.latitude} IS NULL OR (${table.latitude} >= -90 AND ${table.latitude} <= 90)`,
    ),
    check(
      "locations_longitude_bounds",
      sql`${table.longitude} IS NULL OR (${table.longitude} >= -180 AND ${table.longitude} <= 180)`,
    ),
  ],
);

export const locationFeaturedPrices = pgTable(
  "location_featured_prices",
  {
    id: id(),
    locationId: uuid("location_id")
      .notNull()
      .references(() => locations.id, { onDelete: "cascade" }),
    currency: char("currency", { length: 3 }).notNull(),
    startingFromMinor: integer("starting_from_minor").notNull(),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("location_featured_prices_location_currency_unique").on(
      table.locationId,
      table.currency,
    ),
    index("location_featured_prices_location_id_idx").on(table.locationId),
    check(
      "location_featured_prices_non_negative",
      sql`${table.startingFromMinor} >= 0`,
    ),
  ],
);

export const locationTranslations = pgTable(
  "location_translations",
  {
    id: id(),
    locationId: uuid("location_id")
      .notNull()
      .references(() => locations.id, { onDelete: "cascade" }),
    locale: localeColumn(),
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull(),
    description: varchar("description", { length: 1000 }),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("location_translations_location_locale_unique").on(
      table.locationId,
      table.locale,
    ),
    uniqueIndex("location_translations_locale_slug_unique").on(
      table.locale,
      table.slug,
    ),
    index("location_translations_locale_idx").on(table.locale),
  ],
);
