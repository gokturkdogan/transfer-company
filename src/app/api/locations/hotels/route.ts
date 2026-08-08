import { NextResponse, type NextRequest } from "next/server";

import { LocationRepository } from "@/features/locations/server/repository";
import { LocationService } from "@/features/locations/server/service";
import { db } from "@/db/client";
import { getClientIp } from "@/server/http/client-ip";
import {
  RATE_LIMIT_POLICIES,
  rateLimiter,
} from "@/server/rate-limit/postgres-rate-limiter";
import { ValidationError } from "@/server/errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  const rateResult = await rateLimiter.check(
    `locations:hotels:ip:${ip}`,
    RATE_LIMIT_POLICIES.quoteByIp,
  );

  if (!rateResult.allowed) {
    return NextResponse.json(
      { success: false, error: { code: "DOMAIN_RULE_VIOLATION", message: "Rate limit exceeded" } },
      { status: 429 },
    );
  }

  const { searchParams } = new URL(request.url);
  const districtId = searchParams.get("districtId");
  const locale = searchParams.get("locale") ?? "en";

  if (!districtId) {
    throw new ValidationError("districtId is required", {
      districtId: ["districtId is required"],
    });
  }

  const locationService = new LocationService(new LocationRepository(db));
  const hotels = await locationService.getHotelsForDistrict(districtId, locale);

  return NextResponse.json({ success: true, data: hotels });
}
