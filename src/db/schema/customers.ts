import { index, pgTable, varchar } from "drizzle-orm/pg-core";

import { id, timestamps } from "./columns";

export const customers = pgTable(
  "customers",
  {
    id: id(),
    firstName: varchar("first_name", { length: 100 }).notNull(),
    lastName: varchar("last_name", { length: 100 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    phone: varchar("phone", { length: 32 }).notNull(),
    whatsappPhone: varchar("whatsapp_phone", { length: 32 }),
    ...timestamps,
  },
  (table) => [
    index("customers_email_idx").on(table.email),
    index("customers_phone_idx").on(table.phone),
  ],
);
