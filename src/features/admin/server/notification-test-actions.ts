"use server";

import { z } from "zod";

import { resolveSmtpConfig } from "@/config/smtp";
import { requireAdminSession } from "@/features/admin/server/auth";
import { createMockReservationNotificationPayload } from "@/server/notifications/mock-reservation-notification-payload";
import { sendMockReservationTestEmails } from "@/server/notifications/send-test-reservation-emails";
import { createAction } from "@/server/action";

const sendMockReservationEmailSchema = z.object({});

export async function sendMockReservationEmailAction(rawInput: unknown) {
  await requireAdminSession();

  return createAction(sendMockReservationEmailSchema, async () => {
    const smtpConfig = resolveSmtpConfig();
    const testRecipient =
      smtpConfig?.testNotificationEmail ??
      smtpConfig?.adminNotificationEmail ??
      "gokturkdogan24@gmail.com";

    const payload = createMockReservationNotificationPayload({
      customerEmail: testRecipient,
      locale: "tr",
    });

    const recipients = await sendMockReservationTestEmails(payload);

    return {
      reference: payload.reference,
      ...recipients,
    };
  }, rawInput);
}
