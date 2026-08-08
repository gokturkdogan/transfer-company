import { index, pgTable, uniqueIndex } from "drizzle-orm/pg-core";
import { char, varchar } from "drizzle-orm/pg-core";

import { sortOrder, timestamps } from "./columns";

export const enabledCurrencies = pgTable(
  "enabled_currencies",
  {
    code: char("code", { length: 3 }).primaryKey(),
    label: varchar("label", { length: 64 }).notNull(),
    sortOrder: sortOrder(),
    ...timestamps,
  },
  (table) => [index("enabled_currencies_sort_order_idx").on(table.sortOrder)],
);
