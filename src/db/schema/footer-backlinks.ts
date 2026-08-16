import { sql } from "drizzle-orm";
import {
  check,
  integer,
  pgTable,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

import { id, sortOrder, softDelete, timestamps } from "./columns";

export const footerBacklinks = pgTable(
  "footer_backlinks",
  {
    id: id(),
    slotIndex: integer("slot_index").notNull(),
    label: varchar("label", { length: 120 }).notNull().default(""),
    url: varchar("url", { length: 512 }).notNull().default(""),
    sortOrder: sortOrder(),
    ...timestamps,
    ...softDelete,
  },
  (table) => [
    uniqueIndex("footer_backlinks_slot_unique").on(table.slotIndex),
    check(
      "footer_backlinks_slot_index_range",
      sql`${table.slotIndex} >= 0 AND ${table.slotIndex} <= 2`,
    ),
  ],
);
