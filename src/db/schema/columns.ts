import {
  boolean,
  char,
  integer,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const id = () => uuid("id").primaryKey().defaultRandom();

export const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};

export const softDelete = {
  isActive: boolean("is_active").notNull().default(true),
  deletedAt: timestamp("deleted_at", { withTimezone: true, mode: "date" }),
};

export const currency = () => char("currency", { length: 3 }).notNull();

export const priceMinor = () => integer("price_minor").notNull();

export const localeColumn = () => varchar("locale", { length: 5 }).notNull();

export const sortOrder = () => integer("sort_order").notNull().default(0);
