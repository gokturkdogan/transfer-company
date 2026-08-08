import type { LocationType } from "@/db/schema/enums";

export type AirportDto = {
  id: string;
  name: string;
  code: string;
  cityId: string | null;
  sortOrder: number;
};

export type CityDto = {
  id: string;
  name: string;
  code: string;
  sortOrder: number;
};

export type DistrictDto = {
  id: string;
  name: string;
  code: string;
  cityId: string;
  sortOrder: number;
};

export type HotelDto = {
  id: string;
  name: string;
  address: string | null;
  districtId: string;
  sortOrder: number;
};

export type LocationRecordDto = {
  id: string;
  type: LocationType;
  code: string;
  name: string;
  parentId: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  sortOrder: number;
  isActive: boolean;
};

/** @deprecated Use typed DTOs. Kept temporarily for migration. */
export type SelectableLocationDto = {
  id: string;
  name: string;
  type: LocationType;
};
