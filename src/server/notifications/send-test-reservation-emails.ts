import "server-only";

import { clientEnv } from "@/config/env";
import { siteConfig } from "@/config/site";
import { resolveSmtpConfig } from "@/config/smtp";
import { getPublicContactChannels } from "@/features/contact/server/public-contact";
import { sendEmail } from "@/server/notifications/email/send-email";
import { resolveReservationEmailContact } from "@/server/notifications/smtp-notification-service";
import {
  buildAdminReservationEmail,
  buildCustomerReservationEmail,
} from "@/server/notifications/templates/reservation-email";
import type { ReservationNotificationPayload } from "@/server/notifications/types";
import { DomainRuleError } from "@/server/errors";

async function resolveAdminRecipient(
  smtpConfig: NonNullable<ReturnType<typeof resolveSmtpConfig>>,
): Promise<string> {
  if (smtpConfig.adminNotificationEmail) {
    return smtpConfig.adminNotificationEmail;
  }

  const channels = await getPublicContactChannels();

  if (channels.emails.length > 0) {
    return channels.emails[0]!;
  }

  return siteConfig.email;
}

export async function sendMockReservationTestEmails(
  payload: ReservationNotificationPayload,
): Promise<{ customerRecipient: string; adminRecipient: string }> {
  const smtpConfig = resolveSmtpConfig();

  if (!smtpConfig) {
    throw new DomainRuleError("SMTP_NOT_CONFIGURED");
  }

  const adminRecipient = await resolveAdminRecipient(smtpConfig);
  const contact = await resolveReservationEmailContact();
  const customerEmail = buildCustomerReservationEmail(payload, { contact });
  const adminEmail = buildAdminReservationEmail(payload, {
    adminUrl: `${clientEnv.NEXT_PUBLIC_APP_URL}/admin/reservations/${payload.reservationId}`,
    contactEmail: contact.email ?? siteConfig.email,
    contact,
  });

  await sendEmail(smtpConfig, {
    to: payload.customer.email,
    subject: customerEmail.subject,
    html: customerEmail.html,
    text: customerEmail.text,
  });

  await sendEmail(smtpConfig, {
    to: adminRecipient,
    subject: adminEmail.subject,
    html: adminEmail.html,
    text: adminEmail.text,
  });

  return {
    customerRecipient: payload.customer.email,
    adminRecipient,
  };
}
