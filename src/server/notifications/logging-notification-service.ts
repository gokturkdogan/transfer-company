import "server-only";

import { db } from "@/db/client";
import { notificationLogs } from "@/db/schema";
import { logger } from "@/server/logger";

import type {
  NotificationService,
  ReservationNotificationPayload,
} from "./types";

async function logNotification(input: {
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

export class LoggingNotificationService implements NotificationService {
  async sendReservationReceived(
    payload: ReservationNotificationPayload,
  ): Promise<void> {
    logger.info("Reservation received notification queued", {
      reference: payload.reference,
      email: payload.customer.email,
    });

    await logNotification({
      reservationId: payload.reservationId,
      channel: "EMAIL_CUSTOMER",
      recipientType: "CUSTOMER",
      status: "SKIPPED",
      error: "Email provider not configured in Phase 3",
    });
  }

  async sendNewReservationToAdmin(
    payload: ReservationNotificationPayload,
  ): Promise<void> {
    logger.info("New reservation admin notification queued", {
      reference: payload.reference,
    });

    await logNotification({
      reservationId: payload.reservationId,
      channel: "EMAIL_ADMIN",
      recipientType: "ADMIN",
      status: "SKIPPED",
      error: "Email provider not configured in Phase 3",
    });
  }
}

export const notificationService = new LoggingNotificationService();
