import "server-only";

import { z } from "zod";

import { APP_NAME } from "@/config/constants";

const smtpSchema = z.object({
  SMTP_HOST: z.string().min(1),
  SMTP_PORT: z.coerce.number().int().positive(),
  SMTP_USER: z.string().min(1),
  SMTP_PASSWORD: z.string().min(1),
  SMTP_FROM_NAME: z.string().min(1).optional(),
  SMTP_FROM_EMAIL: z.string().email().optional(),
  ADMIN_NOTIFICATION_EMAIL: z.string().email().optional(),
  TEST_NOTIFICATION_EMAIL: z.string().email().optional(),
});

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

function readEnvValue(value: string | undefined): string | undefined {
  const trimmed = value?.trim();

  if (!trimmed) {
    return undefined;
  }

  return trimmed;
}

export function resolveSmtpConfig(): SmtpConfig | null {
  const raw = {
    SMTP_HOST: readEnvValue(process.env.SMTP_HOST),
    SMTP_PORT: readEnvValue(process.env.SMTP_PORT),
    SMTP_USER: readEnvValue(process.env.SMTP_USER),
    SMTP_PASSWORD: readEnvValue(process.env.SMTP_PASSWORD),
    SMTP_FROM_NAME: readEnvValue(process.env.SMTP_FROM_NAME),
    SMTP_FROM_EMAIL: readEnvValue(process.env.SMTP_FROM_EMAIL),
    ADMIN_NOTIFICATION_EMAIL: readEnvValue(process.env.ADMIN_NOTIFICATION_EMAIL),
    TEST_NOTIFICATION_EMAIL: readEnvValue(process.env.TEST_NOTIFICATION_EMAIL),
  };

  const hasAny =
    raw.SMTP_HOST ||
    raw.SMTP_PORT ||
    raw.SMTP_USER ||
    raw.SMTP_PASSWORD;

  if (!hasAny) {
    return null;
  }

  const required = [
    raw.SMTP_HOST,
    raw.SMTP_PORT,
    raw.SMTP_USER,
    raw.SMTP_PASSWORD,
  ];

  if (required.some((value) => !value)) {
    throw new Error(
      "Incomplete SMTP configuration. Set SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASSWORD together.",
    );
  }

  const parsed = smtpSchema.parse(raw);

  return {
    host: parsed.SMTP_HOST,
    port: parsed.SMTP_PORT,
    user: parsed.SMTP_USER,
    password: parsed.SMTP_PASSWORD,
    fromName: parsed.SMTP_FROM_NAME ?? APP_NAME,
    fromEmail: parsed.SMTP_FROM_EMAIL ?? parsed.SMTP_USER,
    adminNotificationEmail: parsed.ADMIN_NOTIFICATION_EMAIL,
    testNotificationEmail: parsed.TEST_NOTIFICATION_EMAIL,
  };
}

export function isSmtpConfigured(): boolean {
  return resolveSmtpConfig() !== null;
}
