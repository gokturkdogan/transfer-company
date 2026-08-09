import "server-only";

import { z } from "zod";

const serverSchema = z.object({
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
