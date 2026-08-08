import { index, pgTable, varchar } from "drizzle-orm/pg-core";

import { id, sortOrder, softDelete, timestamps } from "./columns";
import { contactChannelTypeEnum } from "./enums";

export const contactChannels = pgTable(
  "contact_channels",
  {
    id: id(),
    type: contactChannelTypeEnum("type").notNull(),
    value: varchar("value", { length: 255 }).notNull(),
    sortOrder: sortOrder(),
    ...timestamps,
    ...softDelete,
  },
  (table) => [
    index("contact_channels_type_active_sort_idx").on(
      table.type,
      table.isActive,
      table.sortOrder,
    ),
  ],
);
