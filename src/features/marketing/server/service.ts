import "server-only";

import { MarketingRepository } from "@/features/marketing/server/repository";
import type {
  DistrictStartingPriceDto,
  FleetVehicleDto,
} from "@/features/marketing/types";

const DEFAULT_ORIGIN_AIRPORT_CODE = "AYT";

export class MarketingService {
  constructor(private readonly repository: MarketingRepository) {}

  getPopularDestinations(locale: string): Promise<DistrictStartingPriceDto[]> {
    return this.repository.findDistrictStartingPrices(
      DEFAULT_ORIGIN_AIRPORT_CODE,
      locale,
    );
  }

  getFleet(locale: string): Promise<FleetVehicleDto[]> {
    return this.repository.findFleetStartingPrices(locale);
  }
}

export function createMarketingService(repository: MarketingRepository) {
  return new MarketingService(repository);
}
