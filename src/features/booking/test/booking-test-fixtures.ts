import type { AirportDto, CityDto, DistrictDto } from "@/features/locations/types";

export const testAirports: AirportDto[] = [
  { id: "loc-a", name: "Airport", code: "AYT", cityId: "city-1", sortOrder: 0 },
];

export const testCities: CityDto[] = [
  { id: "city-1", name: "Antalya", code: "ANTALYA", sortOrder: 0 },
];

export const testDistricts: DistrictDto[] = [
  { id: "loc-b", name: "Belek", code: "BELEK", cityId: "city-1", sortOrder: 0 },
];
