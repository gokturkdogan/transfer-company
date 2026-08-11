import { z } from "zod";

import { db } from "@/db/client";
import { LocationRepository } from "@/features/locations/server/repository";
import { LocationService } from "@/features/locations/server/service";
import { getClientIp } from "@/server/http/client-ip";
import { createRouteHandler } from "@/server/http/route-handler";
import {
  RATE_LIMIT_POLICIES,
  rateLimiter,
} from "@/server/rate-limit/postgres-rate-limiter";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const hotelsQuerySchema = z.object({
  districtId: z.string().uuid(),
  locale: z.string().min(2).max(5).default("en"),
});

export const GET = createRouteHandler({
  schema: hotelsQuerySchema,
  inputSource: "searchParams",
  rateLimit: {
    limiter: rateLimiter,
    policy: RATE_LIMIT_POLICIES.quoteByIp,
    buildBucketKey: (request) =>
      `locations:hotels:ip:${getClientIp(request)}`,
  },
  handler: async (input) => {
    const locationService = new LocationService(new LocationRepository(db));
    return locationService.getHotelsForDistrict(input.districtId, input.locale);
  },
});
