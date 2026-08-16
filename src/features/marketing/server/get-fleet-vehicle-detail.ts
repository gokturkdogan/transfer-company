import "server-only";

import { cache } from "react";

import { getCachedFleetVehicleDetail } from "@/server/cache/public-catalog";

export const getFleetVehicleDetailForPage = cache(
  async (code: string, locale: string) =>
    getCachedFleetVehicleDetail(code, locale),
);
