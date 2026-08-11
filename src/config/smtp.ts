import "server-only";

import { APP_NAME } from "@/config/constants";
import { serverEnv } from "@/config/env";

export type SmtpConfig = {
  host: string;
  port: number;
  user: string;
  password: string;
  fromName: string;
  fromEmail: string;
  adminNotificationEmail?: string;
  testNotificationEmail?: string;
};

export function resolveSmtpConfig(): SmtpConfig | null {
  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASSWORD,
    SMTP_FROM_NAME,
    SMTP_FROM_EMAIL,
    ADMIN_NOTIFICATION_EMAIL,
    TEST_NOTIFICATION_EMAIL,
  } = serverEnv;

  if (!SMTP_HOST && !SMTP_PORT && !SMTP_USER && !SMTP_PASSWORD) {
    return null;
  }

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASSWORD) {
    throw new Error(
      "Incomplete SMTP configuration. Set SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASSWORD together.",
    );
  }

  return {
    host: SMTP_HOST,
    port: SMTP_PORT,
    user: SMTP_USER,
    password: SMTP_PASSWORD,
    fromName: SMTP_FROM_NAME ?? APP_NAME,
    fromEmail: SMTP_FROM_EMAIL ?? SMTP_USER,
    adminNotificationEmail: ADMIN_NOTIFICATION_EMAIL,
    testNotificationEmail: TEST_NOTIFICATION_EMAIL,
  };
}

export function isSmtpConfigured(): boolean {
  return resolveSmtpConfig() !== null;
}
