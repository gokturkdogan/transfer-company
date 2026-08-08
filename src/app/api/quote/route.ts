import { availabilityService } from "@/server/services";
import { createRouteHandler } from "@/server/http/route-handler";
import { getClientIp } from "@/server/http/client-ip";
import {
  RATE_LIMIT_POLICIES,
  rateLimiter,
} from "@/server/rate-limit/postgres-rate-limiter";
import { transferAvailabilityInputSchema } from "@/features/pricing/schemas/availability";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = createRouteHandler({
  schema: transferAvailabilityInputSchema,
  rateLimit: {
    limiter: rateLimiter,
    policy: RATE_LIMIT_POLICIES.quoteByIp,
    buildBucketKey: (request) =>
      `quote:ip:${getClientIp(request)}`,
  },
  handler: async (input) => availabilityService.getTransferOptions(input),
});
