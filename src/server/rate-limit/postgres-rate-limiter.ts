import "server-only";

import { sql } from "drizzle-orm";

import { db } from "@/db/client";
import { rateLimitBuckets } from "@/db/schema";

export type RateLimitPolicy = {
  name: string;
  limit: number;
  windowMs: number;
};

export type RateLimitResult = {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: Date;
};

export type RateLimiter = {
  check(bucketKey: string, policy: RateLimitPolicy): Promise<RateLimitResult>;
};

function getWindowStart(now: Date, windowMs: number): Date {
  const timestamp = Math.floor(now.getTime() / windowMs) * windowMs;
  return new Date(timestamp);
}

export class PostgresRateLimiter implements RateLimiter {
  async check(
    bucketKey: string,
    policy: RateLimitPolicy,
  ): Promise<RateLimitResult> {
    const now = new Date();
    const windowStart = getWindowStart(now, policy.windowMs);
    const resetAt = new Date(windowStart.getTime() + policy.windowMs);

    const [result] = await db
      .insert(rateLimitBuckets)
      .values({
        bucketKey,
        windowStart,
        hitCount: 1,
      })
      .onConflictDoUpdate({
        target: [rateLimitBuckets.bucketKey, rateLimitBuckets.windowStart],
        set: {
          hitCount: sql`${rateLimitBuckets.hitCount} + 1`,
        },
      })
      .returning({ hitCount: rateLimitBuckets.hitCount });

    const hitCount = result?.hitCount ?? 1;
    const allowed = hitCount <= policy.limit;

    return {
      allowed,
      limit: policy.limit,
      remaining: Math.max(policy.limit - hitCount, 0),
      resetAt,
    };
  }
}

export const rateLimiter = new PostgresRateLimiter();

export const RATE_LIMIT_POLICIES = {
  quoteByIp: {
    name: "quote-by-ip",
    limit: 30,
    windowMs: 60_000,
  },
  reservationByIp: {
    name: "reservation-by-ip",
    limit: 10,
    windowMs: 60 * 60_000,
  },
  reservationByEmail: {
    name: "reservation-by-email",
    limit: 5,
    windowMs: 60 * 60_000,
  },
} as const satisfies Record<string, RateLimitPolicy>;
