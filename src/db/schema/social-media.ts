import { pgTable, uniqueIndex, varchar } from "drizzle-orm/pg-core";

import { id, sortOrder, softDelete, timestamps } from "./columns";
import { socialMediaPlatformEnum } from "./enums";

export const socialMediaLinks = pgTable(
  "social_media_links",
  {
    id: id(),
    platform: socialMediaPlatformEnum("platform").notNull(),
    url: varchar("url", { length: 512 }).notNull().default(""),
    sortOrder: sortOrder(),
    ...timestamps,
    ...softDelete,
  },
  (table) => [
    uniqueIndex("social_media_links_platform_unique").on(table.platform),
  ],
);
