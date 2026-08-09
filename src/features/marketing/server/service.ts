import "server-only";

import { MarketingRepository } from "@/features/marketing/server/repository";
import type {
  DistrictStartingPriceDto,
  FleetVehicleDto,
} from "@/features/marketing/types";

export class MarketingService {
  constructor(private readonly repository: MarketingRepository) {}

  getPopularDestinations(
    locale: string,
    displayCurrency: string,
  ): Promise<DistrictStartingPriceDto[]> {
    return this.repository.findFeaturedDistricts(locale, displayCurrency);
  }

  getFleet(locale: string): Promise<FleetVehicleDto[]> {
    return this.repository.findFleetStartingPrices(locale);
  }
}

export function createMarketingService(repository: MarketingRepository) {
  return new MarketingService(repository);
}
