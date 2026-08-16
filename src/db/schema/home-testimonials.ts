import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  pgTable,
  text,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

import { localeColumn, sortOrder, softDelete, timestamps } from "./columns";
import { id } from "./columns";

export const homeTestimonials = pgTable(
  "home_testimonials",
  {
    id: id(),
    locale: localeColumn(),
    slotIndex: integer("slot_index").notNull(),
    firstName: varchar("first_name", { length: 64 }).notNull().default(""),
    lastName: varchar("last_name", { length: 64 }).notNull().default(""),
    quote: text("quote").notNull().default(""),
    rating: integer("rating").notNull().default(5),
    sortOrder: sortOrder(),
    ...timestamps,
    ...softDelete,
  },
  (table) => [
    uniqueIndex("home_testimonials_locale_slot_unique").on(
      table.locale,
      table.slotIndex,
    ),
    index("home_testimonials_locale_active_sort_idx").on(
      table.locale,
      table.isActive,
      table.sortOrder,
    ),
    check(
      "home_testimonials_rating_range",
      sql`${table.rating} >= 1 AND ${table.rating} <= 5`,
    ),
    check(
      "home_testimonials_slot_index_range",
      sql`${table.slotIndex} >= 0 AND ${table.slotIndex} <= 2`,
    ),
  ],
);
