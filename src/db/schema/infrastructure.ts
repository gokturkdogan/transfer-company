import {
  char,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";
import { uuid } from "drizzle-orm/pg-core";

import { id, timestamps } from "./columns";
import { reservations } from "./reservations";

export const reservationIdempotencyKeys = pgTable(
  "reservation_idempotency_keys",
  {
    id: id(),
    key: varchar("key", { length: 64 }).notNull(),
    requestHash: char("request_hash", { length: 64 }).notNull(),
    reservationId: uuid("reservation_id").references(() => reservations.id),
    expiresAt: timestamp("expires_at", {
      withTimezone: true,
      mode: "date",
    }).notNull(),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("reservation_idempotency_keys_key_unique").on(table.key),
    index("reservation_idempotency_keys_reservation_id_idx").on(
      table.reservationId,
    ),
    index("reservation_idempotency_keys_expires_at_idx").on(table.expiresAt),
  ],
);

export const rateLimitBuckets = pgTable(
  "rate_limit_buckets",
  {
    id: id(),
    bucketKey: varchar("bucket_key", { length: 255 }).notNull(),
    windowStart: timestamp("window_start", {
      withTimezone: true,
      mode: "date",
    }).notNull(),
    hitCount: integer("hit_count").notNull().default(1),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("rate_limit_buckets_key_window_unique").on(
      table.bucketKey,
      table.windowStart,
    ),
    index("rate_limit_buckets_window_start_idx").on(table.windowStart),
  ],
);

export const NOTIFICATION_CHANNELS = [
  "EMAIL_CUSTOMER",
  "EMAIL_ADMIN",
] as const;

export const NOTIFICATION_STATUSES = ["SENT", "FAILED", "SKIPPED"] as const;

export const notificationLogs = pgTable(
  "notification_logs",
  {
    id: id(),
    reservationId: uuid("reservation_id")
      .notNull()
      .references(() => reservations.id),
    channel: varchar("channel", { length: 32 }).notNull(),
    recipientType: varchar("recipient_type", { length: 32 }).notNull(),
    status: varchar("status", { length: 16 }).notNull(),
    error: text("error"),
    ...timestamps,
  },
  (table) => [
    index("notification_logs_reservation_id_idx").on(table.reservationId),
    index("notification_logs_status_idx").on(table.status),
    index("notification_logs_created_at_idx").on(table.createdAt),
  ],
);
