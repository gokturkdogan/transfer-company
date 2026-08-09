import "server-only";

import { MarketingRepository } from "@/features/marketing/server/repository";
import type {
  DistrictStartingPriceDto,
  FleetVehicleDetailDto,
  FleetVehicleDto,
} from "@/features/marketing/types";
import { VehicleFeatureRepository } from "@/features/vehicles/server/feature-repository";
import { VehicleGalleryRepository } from "@/features/vehicles/server/gallery-repository";

export class MarketingService {
  constructor(
    private readonly repository: MarketingRepository,
    private readonly featureRepository: VehicleFeatureRepository,
    private readonly galleryRepository: VehicleGalleryRepository,
  ) {}

  getPopularDestinations(locale: string): Promise<DistrictStartingPriceDto[]> {
    return this.repository.findFeaturedDistricts(locale);
  }

  getFleet(locale: string): Promise<FleetVehicleDto[]> {
    return this.repository.findFleetStartingPrices(locale);
  }

  getActiveFleetCodes(): Promise<string[]> {
    return this.repository.findActiveFleetCodes();
  }

  async getFleetVehicleDetail(
    code: string,
    locale: string,
  ): Promise<FleetVehicleDetailDto | null> {
    const vehicle = await this.repository.findFleetVehicleByCode(code, locale);

    if (!vehicle) {
      return null;
    }

    const [featuresByVehicle, galleryByVehicle] = await Promise.all([
      this.featureRepository.listLabelsByVehicleIds([vehicle.id], locale),
      this.galleryRepository.listImageKeysByVehicleIds([vehicle.id]),
    ]);

    return {
      ...vehicle,
      features: featuresByVehicle.get(vehicle.id) ?? [],
      galleryImageKeys: galleryByVehicle.get(vehicle.id) ?? [],
    };
  }
}

export function createMarketingService(
  repository: MarketingRepository,
  featureRepository: VehicleFeatureRepository,
  galleryRepository: VehicleGalleryRepository,
) {
  return new MarketingService(repository, featureRepository, galleryRepository);
}
