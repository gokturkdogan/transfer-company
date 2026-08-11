import "server-only";

import { logger } from "@/server/logger";
import { logNotification } from "@/server/notifications/notification-log";
import type {
  NotificationService,
  ReservationNotificationPayload,
} from "@/server/notifications/types";

export class LoggingNotificationService implements NotificationService {
  async sendReservationReceived(
    payload: ReservationNotificationPayload,
  ): Promise<void> {
    logger.info("Reservation received notification skipped", {
      reference: payload.reference,
      email: payload.customer.email,
    });

    await logNotification({
      reservationId: payload.reservationId,
      channel: "EMAIL_CUSTOMER",
      recipientType: "CUSTOMER",
      status: "SKIPPED",
      error: "SMTP is not configured",
    });
  }

  async sendNewReservationToAdmin(
    payload: ReservationNotificationPayload,
  ): Promise<void> {
    logger.info("Admin reservation notification skipped", {
      reference: payload.reference,
    });

    await logNotification({
      reservationId: payload.reservationId,
      channel: "EMAIL_ADMIN",
      recipientType: "ADMIN",
      status: "SKIPPED",
      error: "SMTP is not configured",
    });
  }
}
