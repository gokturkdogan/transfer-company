import { boolean, index, pgTable, varchar } from "drizzle-orm/pg-core";

import { sortOrder, timestamps } from "./columns";

export const enabledLocales = pgTable(
  "enabled_locales",
  {
    code: varchar("code", { length: 5 }).primaryKey(),
    label: varchar("label", { length: 64 }).notNull(),
    sortOrder: sortOrder(),
    isActive: boolean("is_active").notNull().default(true),
    ...timestamps,
  },
  (table) => [
    index("enabled_locales_active_sort_idx").on(table.isActive, table.sortOrder),
  ],
);
