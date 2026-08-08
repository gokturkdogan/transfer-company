import type { NextRequest } from "next/server";

import { createReservationInputSchema } from "@/features/booking/schemas/reservation";
import { bookingService } from "@/server/services";
import { createRouteHandler } from "@/server/http/route-handler";
import { getClientIp } from "@/server/http/client-ip";
import {
  RATE_LIMIT_POLICIES,
  rateLimiter,
} from "@/server/rate-limit/postgres-rate-limiter";
import { ValidationError } from "@/server/errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = createRouteHandler({
  schema: createReservationInputSchema,
  rateLimit: {
    limiter: rateLimiter,
    policy: RATE_LIMIT_POLICIES.reservationByIp,
    buildBucketKey: (request) => `reservation:ip:${getClientIp(request)}`,
  },
  handler: async (input, request: NextRequest) => {
    const idempotencyKey = request.headers.get("idempotency-key");

    if (!idempotencyKey) {
      throw new ValidationError("Idempotency-Key header is required", {
        idempotencyKey: ["Idempotency-Key header is required"],
      });
    }

    const emailResult = await rateLimiter.check(
      `reservation:email:${input.customer.email.toLowerCase()}`,
      RATE_LIMIT_POLICIES.reservationByEmail,
    );

    if (!emailResult.allowed) {
      throw new ValidationError("Too many reservation requests for this email");
    }

    return bookingService.createReservation(input, { idempotencyKey });
  },
});
