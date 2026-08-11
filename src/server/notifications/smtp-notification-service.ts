import "server-only";

import { clientEnv } from "@/config/env";
import { siteConfig } from "@/config/site";
import type { SmtpConfig } from "@/config/smtp";
import { getPublicContactChannels } from "@/features/contact/server/public-contact";
import { logger } from "@/server/logger";
import { sendEmail } from "@/server/notifications/email/send-email";
import { logNotification } from "@/server/notifications/notification-log";
import {
  buildAdminReservationEmail,
  buildCustomerReservationEmail,
} from "@/server/notifications/templates/reservation-email";
import type {
  NotificationService,
  ReservationNotificationPayload,
} from "@/server/notifications/types";

async function resolveAdminEmail(
  config: SmtpConfig,
): Promise<string> {
  if (config.adminNotificationEmail) {
    return config.adminNotificationEmail;
  }

  const channels = await getPublicContactChannels();

  if (channels.emails.length > 0) {
    return channels.emails[0]!;
  }

  return siteConfig.email;
}

export class SmtpNotificationService implements NotificationService {
  constructor(private readonly smtpConfig: SmtpConfig) {}

  async sendReservationReceived(
    payload: ReservationNotificationPayload,
  ): Promise<void> {
    const email = buildCustomerReservationEmail(payload);

    try {
      await sendEmail(this.smtpConfig, {
        to: payload.customer.email,
        subject: email.subject,
        html: email.html,
        text: email.text,
      });

      await logNotification({
        reservationId: payload.reservationId,
        channel: "EMAIL_CUSTOMER",
        recipientType: "CUSTOMER",
        status: "SENT",
      });

      logger.info("Customer reservation email sent", {
        reference: payload.reference,
        email: payload.customer.email,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown SMTP error";

      await logNotification({
        reservationId: payload.reservationId,
        channel: "EMAIL_CUSTOMER",
        recipientType: "CUSTOMER",
        status: "FAILED",
        error: message,
      });

      throw error;
    }
  }

  async sendNewReservationToAdmin(
    payload: ReservationNotificationPayload,
  ): Promise<void> {
    const adminEmail = await resolveAdminEmail(this.smtpConfig);
    const adminUrl = `${clientEnv.NEXT_PUBLIC_APP_URL}/admin/reservations/${payload.reservationId}`;
    const email = buildAdminReservationEmail(payload, {
      adminUrl,
      contactEmail: siteConfig.email,
    });

    try {
      await sendEmail(this.smtpConfig, {
        to: adminEmail,
        subject: email.subject,
        html: email.html,
        text: email.text,
      });

      await logNotification({
        reservationId: payload.reservationId,
        channel: "EMAIL_ADMIN",
        recipientType: "ADMIN",
        status: "SENT",
      });

      logger.info("Admin reservation email sent", {
        reference: payload.reference,
        email: adminEmail,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown SMTP error";

      await logNotification({
        reservationId: payload.reservationId,
        channel: "EMAIL_ADMIN",
        recipientType: "ADMIN",
        status: "FAILED",
        error: message,
      });

      throw error;
    }
  }
}
