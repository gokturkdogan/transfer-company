import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { ZodType } from "zod";

import { isAppError, toPublicError } from "@/server/errors";
import { logger } from "@/server/logger";
import type {
  RateLimitPolicy,
  RateLimiter,
} from "@/server/rate-limit/postgres-rate-limiter";
import { failure, success, type ActionResult } from "@/server/result";

type RateLimitConfig = {
  limiter: RateLimiter;
  buildBucketKey: (request: NextRequest, input: unknown) => string | string[];
  policy: RateLimitPolicy;
};

type RouteHandlerConfig<TInput, TOutput> = {
  schema: ZodType<TInput>;
  /** Default `json` (POST body). Use `searchParams` for GET query validation. */
  inputSource?: "json" | "searchParams";
  rateLimit?: RateLimitConfig;
  handler: (input: TInput, request: NextRequest) => Promise<TOutput>;
};

function jsonResponse<T>(result: ActionResult<T>, status = 200) {
  if (!result.success) {
    const statusCode =
      result.error.code === "VALIDATION_ERROR"
        ? 400
        : result.error.code === "NOT_FOUND"
          ? 404
          : result.error.code === "DOMAIN_RULE_VIOLATION"
            ? 422
            : 500;

    return NextResponse.json(result, { status: statusCode });
  }

  return NextResponse.json(result, { status });
}

async function applyRateLimit(
  request: NextRequest,
  input: unknown,
  config: RateLimitConfig,
): Promise<NextResponse | null> {
  const bucketKeys = config.buildBucketKey(request, input);
  const keys = Array.isArray(bucketKeys) ? bucketKeys : [bucketKeys];

  for (const bucketKey of keys) {
    const result = await config.limiter.check(bucketKey, config.policy);

    if (!result.allowed) {
      return NextResponse.json(
        failure({
          code: "DOMAIN_RULE_VIOLATION",
          message: "Too many requests. Please try again later.",
        }),
        {
          status: 429,
          headers: {
            "Retry-After": String(
              Math.ceil((result.resetAt.getTime() - Date.now()) / 1000),
            ),
            "X-RateLimit-Limit": String(result.limit),
            "X-RateLimit-Remaining": String(result.remaining),
            "X-RateLimit-Reset": result.resetAt.toISOString(),
          },
        },
      );
    }
  }

  return null;
}

async function readInput(
  request: NextRequest,
  inputSource: "json" | "searchParams",
): Promise<{ ok: true; value: unknown } | { ok: false; response: NextResponse }> {
  if (inputSource === "searchParams") {
    return {
      ok: true,
      value: Object.fromEntries(new URL(request.url).searchParams.entries()),
    };
  }

  try {
    return { ok: true, value: await request.json() };
  } catch {
    return {
      ok: false,
      response: jsonResponse(
        failure({
          code: "VALIDATION_ERROR",
          message: "Invalid JSON body",
        }),
        400,
      ),
    };
  }
}

export function createRouteHandler<TInput, TOutput>(
  config: RouteHandlerConfig<TInput, TOutput>,
) {
  const inputSource = config.inputSource ?? "json";

  return async function routeHandler(request: NextRequest) {
    const raw = await readInput(request, inputSource);

    if (!raw.ok) {
      return raw.response;
    }

    const parsed = config.schema.safeParse(raw.value);

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors as Record<
        string,
        string[]
      >;

      return jsonResponse(
        failure({
          code: "VALIDATION_ERROR",
          message: "Validation failed",
          fieldErrors,
        }),
        400,
      );
    }

    if (config.rateLimit) {
      const rateLimited = await applyRateLimit(
        request,
        parsed.data,
        config.rateLimit,
      );

      if (rateLimited) {
        return rateLimited;
      }
    }

    try {
      const data = await config.handler(parsed.data, request);
      return jsonResponse(success(data));
    } catch (error) {
      logger.error("Route handler failed", {
        error: error instanceof Error ? error.message : "Unknown error",
      });

      if (isAppError(error)) {
        return NextResponse.json(failure(toPublicError(error)), {
          status: error.statusCode,
        });
      }

      return jsonResponse(
        failure({
          code: "UNKNOWN_ERROR",
          message: "An unexpected error occurred",
        }),
        500,
      );
    }
  };
}
