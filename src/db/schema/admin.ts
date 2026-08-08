import { index, pgTable, timestamp, uniqueIndex, varchar } from "drizzle-orm/pg-core";
import { uuid } from "drizzle-orm/pg-core";

import { id, softDelete, timestamps } from "./columns";

export const adminUsers = pgTable(
  "admin_users",
  {
    id: id(),
    email: varchar("email", { length: 255 }).notNull(),
    passwordHash: varchar("password_hash", { length: 255 }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    ...timestamps,
    ...softDelete,
  },
  (table) => [
    uniqueIndex("admin_users_email_unique").on(table.email),
    index("admin_users_is_active_idx").on(table.isActive),
  ],
);

export const adminSessions = pgTable(
  "admin_sessions",
  {
    id: id(),
    adminUserId: uuid("admin_user_id")
      .notNull()
      .references(() => adminUsers.id, { onDelete: "cascade" }),
    tokenHash: varchar("token_hash", { length: 64 }).notNull(),
    expiresAt: timestamp("expires_at", {
      withTimezone: true,
      mode: "date",
    }).notNull(),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("admin_sessions_token_hash_unique").on(table.tokenHash),
    index("admin_sessions_admin_user_id_idx").on(table.adminUserId),
    index("admin_sessions_expires_at_idx").on(table.expiresAt),
  ],
);
