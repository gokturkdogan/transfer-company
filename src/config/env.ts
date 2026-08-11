import "server-only";

import { z } from "zod";

const optionalNonEmpty = z.preprocess(
  (value) => {
    if (typeof value !== "string") {
      return value;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  },
  z.string().min(1).optional(),
);

const optionalEmail = z.preprocess(
  (value) => {
    if (typeof value !== "string") {
      return value;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  },
  z.string().email().optional(),
);

const serverSchema = z
  .object({
    DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
    ADMIN_SESSION_SECRET: z
      .string()
      .min(32, "ADMIN_SESSION_SECRET must be at least 32 characters")
      .optional(),
    CLOUDINARY_CLOUD_NAME: z.string().min(1, "CLOUDINARY_CLOUD_NAME is required"),
    CLOUDINARY_API_KEY: z.string().min(1, "CLOUDINARY_API_KEY is required"),
    CLOUDINARY_API_SECRET: z
      .string()
      .min(1, "CLOUDINARY_API_SECRET is required"),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
    SMTP_HOST: optionalNonEmpty,
    SMTP_PORT: z.preprocess((value) => {
      if (value === undefined || value === null || value === "") {
        return undefined;
      }

      return value;
    }, z.coerce.number().int().positive().optional()),
    SMTP_USER: optionalNonEmpty,
    SMTP_PASSWORD: optionalNonEmpty,
    SMTP_FROM_NAME: optionalNonEmpty,
    SMTP_FROM_EMAIL: optionalEmail,
    ADMIN_NOTIFICATION_EMAIL: optionalEmail,
    TEST_NOTIFICATION_EMAIL: optionalEmail,
  })
  .superRefine((data, ctx) => {
    const smtpValues = [
      data.SMTP_HOST,
      data.SMTP_PORT,
      data.SMTP_USER,
      data.SMTP_PASSWORD,
    ];
    const presentCount = smtpValues.filter((value) => value !== undefined).length;

    if (presentCount > 0 && presentCount < 4) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Incomplete SMTP configuration. Set SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASSWORD together.",
        path: ["SMTP_HOST"],
      });
    }
  });

const clientSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
});

export type ServerEnv = z.infer<typeof serverSchema>;
export type ClientEnv = z.infer<typeof clientSchema>;

function createServerEnv(): ServerEnv {
  if (process.env.SKIP_ENV_VALIDATION === "true") {
    return {
      DATABASE_URL:
        process.env.DATABASE_URL ??
        "postgresql://placeholder:placeholder@localhost/placeholder?sslmode=require",
      ADMIN_SESSION_SECRET:
        process.env.ADMIN_SESSION_SECRET ??
        "dev-only-admin-session-secret-32chars!",
      CLOUDINARY_CLOUD_NAME:
        process.env.CLOUDINARY_CLOUD_NAME ?? "pdyhhkjq",
      CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY ?? "dev-cloudinary-key",
      CLOUDINARY_API_SECRET:
        process.env.CLOUDINARY_API_SECRET ?? "dev-cloudinary-secret",
      NODE_ENV:
        (process.env.NODE_ENV as ServerEnv["NODE_ENV"] | undefined) ??
        "development",
      LOG_LEVEL:
        (process.env.LOG_LEVEL as ServerEnv["LOG_LEVEL"] | undefined) ?? "info",
      SMTP_HOST: process.env.SMTP_HOST?.trim() || undefined,
      SMTP_PORT: process.env.SMTP_PORT
        ? Number(process.env.SMTP_PORT)
        : undefined,
      SMTP_USER: process.env.SMTP_USER?.trim() || undefined,
      SMTP_PASSWORD: process.env.SMTP_PASSWORD?.trim() || undefined,
      SMTP_FROM_NAME: process.env.SMTP_FROM_NAME?.trim() || undefined,
      SMTP_FROM_EMAIL: process.env.SMTP_FROM_EMAIL?.trim() || undefined,
      ADMIN_NOTIFICATION_EMAIL:
        process.env.ADMIN_NOTIFICATION_EMAIL?.trim() || undefined,
      TEST_NOTIFICATION_EMAIL:
        process.env.TEST_NOTIFICATION_EMAIL?.trim() || undefined,
    };
  }

  return serverSchema.parse({
    DATABASE_URL: process.env.DATABASE_URL,
    ADMIN_SESSION_SECRET: process.env.ADMIN_SESSION_SECRET,
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
    NODE_ENV: process.env.NODE_ENV,
    LOG_LEVEL: process.env.LOG_LEVEL,
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASSWORD: process.env.SMTP_PASSWORD,
    SMTP_FROM_NAME: process.env.SMTP_FROM_NAME,
    SMTP_FROM_EMAIL: process.env.SMTP_FROM_EMAIL,
    ADMIN_NOTIFICATION_EMAIL: process.env.ADMIN_NOTIFICATION_EMAIL,
    TEST_NOTIFICATION_EMAIL: process.env.TEST_NOTIFICATION_EMAIL,
  });
}

function createClientEnv(): ClientEnv {
  if (process.env.SKIP_ENV_VALIDATION === "true") {
    return {
      NEXT_PUBLIC_APP_URL:
        process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
    };
  }

  return clientSchema.parse({
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  });
}

export const serverEnv = createServerEnv();
export const clientEnv = createClientEnv();
