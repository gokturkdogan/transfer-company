import "server-only";

import { db } from "@/db/client";
import { notificationLogs } from "@/db/schema";

export async function logNotification(input: {
  reservationId: string;
  channel: string;
  recipientType: string;
  status: "SENT" | "FAILED" | "SKIPPED";
  error?: string;
}) {
  await db.insert(notificationLogs).values({
    reservationId: input.reservationId,
    channel: input.channel,
    recipientType: input.recipientType,
    status: input.status,
    error: input.error,
  });
}
