import "server-only";

import type {
  AirportDto,
  CityDto,
  DistrictDto,
  HotelDto,
  LocationRecordDto,
} from "@/features/locations/types";
import type { LocationType } from "@/db/schema/enums";

import { LocationRepository } from "./repository";

export class LocationService {
  constructor(private readonly repository: LocationRepository) {}

  getAirports(locale: string): Promise<AirportDto[]> {
    return this.repository.findAirports(locale);
  }

  getCities(locale: string): Promise<CityDto[]> {
    return this.repository.findCities(locale);
  }

  getDistrictsForCity(cityId: string, locale: string): Promise<DistrictDto[]> {
    return this.repository.findDistrictsForCity(cityId, locale);
  }

  getHotelsForDistrict(
    districtId: string,
    locale: string,
  ): Promise<HotelDto[]> {
    return this.repository.findHotelsForDistrict(districtId, locale);
  }

  getLocationById(id: string, locale: string): Promise<LocationRecordDto | null> {
    return this.repository.findById(id, locale);
  }

  getAdminLocations(filters: {
    type?: LocationType;
    parentId?: string;
    cityId?: string;
    search?: string;
    includeInactive?: boolean;
    locale?: string;
  }): Promise<LocationRecordDto[]> {
    return this.repository.findAdminLocations(filters);
  }
}

export function createLocationService(repository: LocationRepository) {
  return new LocationService(repository);
}
