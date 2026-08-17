import { pgTable, varchar } from "drizzle-orm/pg-core";

import { timestamps } from "./columns";

export const FOOTER_SETTINGS_SINGLETON_ID = "default";

export const footerSettings = pgTable("footer_settings", {
  id: varchar("id", { length: 32 })
    .primaryKey()
    .notNull()
    .default(FOOTER_SETTINGS_SINGLETON_ID),
  tursabLicenseNumber: varchar("tursab_license_number", { length: 64 })
    .notNull()
    .default(""),
  ...timestamps,
});
