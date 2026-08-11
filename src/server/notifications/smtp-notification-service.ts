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
  buildCustomerReservationStatusEmail,
  type ReservationEmailContact,
} from "@/server/notifications/templates/reservation-email";
import type {
  NotificationService,
  ReservationNotificationPayload,
  ReservationStatusUpdateNotificationPayload,
} from "@/server/notifications/types";

export async function resolveReservationEmailContact(): Promise<ReservationEmailContact> {
  try {
    const channels = await getPublicContactChannels();

    return {
      phone: channels.phones[0],
      email: channels.emails[0],
      whatsapp: channels.whatsapps[0],
    };
  } catch {
    return {};
  }
}

async function resolveAdminEmail(config: SmtpConfig): Promise<string> {
  if (config.adminNotificationEmail) {
    return config.adminNotificationEmail;
  }

  const contact = await resolveReservationEmailContact();

  return contact.email ?? siteConfig.email;
}

export class SmtpNotificationService implements NotificationService {
  constructor(private readonly smtpConfig: SmtpConfig) {}

  async sendReservationReceived(
    payload: ReservationNotificationPayload,
  ): Promise<void> {
    const contact = await resolveReservationEmailContact();
    const email = buildCustomerReservationEmail(payload, { contact });

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
    const contact = await resolveReservationEmailContact();
    const adminUrl = `${clientEnv.NEXT_PUBLIC_APP_URL}/admin/reservations/${payload.reservationId}`;
    const email = buildAdminReservationEmail(payload, {
      adminUrl,
      contactEmail: contact.email ?? siteConfig.email,
      contact,
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

  async sendReservationStatusUpdate(
    payload: ReservationStatusUpdateNotificationPayload,
  ): Promise<void> {
    const contact = await resolveReservationEmailContact();
    const email = buildCustomerReservationStatusEmail(payload, { contact });

    try {
      await sendEmail(this.smtpConfig, {
        to: payload.customer.email,
        subject: email.subject,
        html: email.html,
        text: email.text,
      });

      await logNotification({
        reservationId: payload.reservationId,
        channel: "EMAIL_STATUS_CUSTOMER",
        recipientType: "CUSTOMER",
        status: "SENT",
      });

      logger.info("Customer reservation status email sent", {
        reference: payload.reference,
        email: payload.customer.email,
        previousStatus: payload.previousStatus,
        nextStatus: payload.nextStatus,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown SMTP error";

      await logNotification({
        reservationId: payload.reservationId,
        channel: "EMAIL_STATUS_CUSTOMER",
        recipientType: "CUSTOMER",
        status: "FAILED",
        error: message,
      });

      throw error;
    }
  }
}
