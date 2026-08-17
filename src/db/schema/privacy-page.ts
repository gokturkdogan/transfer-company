import { index, pgTable, text, uniqueIndex } from "drizzle-orm/pg-core";

import { localeColumn, timestamps } from "./columns";
import { id } from "./columns";

export const privacyPageTranslations = pgTable(
  "privacy_page_translations",
  {
    id: id(),
    locale: localeColumn(),
    content: text("content").notNull().default(""),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("privacy_page_translations_locale_unique").on(table.locale),
    index("privacy_page_translations_locale_idx").on(table.locale),
  ],
);
