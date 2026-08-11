import { vi } from "vitest";

import type { LocationType } from "@/db/schema/enums";
import type { LocationRepository } from "@/features/locations/server/repository";
import type {
  AirportDto,
  CityDto,
  DistrictDto,
  HotelDto,
  LocationRecordDto,
} from "@/features/locations/types";

type SeedLocation = LocationRecordDto;

export function createLocationRepositoryFake(
  seed: SeedLocation[] = [],
): LocationRepository {
  const locations = [...seed];

  const repo = {
    findById: vi.fn(async (id: string) => {
      const row = locations.find((location) => location.id === id);

      if (!row) {
        return null;
      }

      return row;
    }),

    findAirports: vi.fn(async () => {
      return locations
        .filter((location) => location.type === "AIRPORT" && location.isActive)
        .map(
          (location): AirportDto => ({
            id: location.id,
            name: location.name,
            code: location.code,
            cityId: location.parentId,
            sortOrder: location.sortOrder,
          }),
        );
    }),

    findCities: vi.fn(async () => {
      return locations
        .filter((location) => location.type === "CITY" && location.isActive)
        .map(
          (location): CityDto => ({
            id: location.id,
            name: location.name,
            code: location.code,
            sortOrder: location.sortOrder,
          }),
        );
    }),

    findDistrictsForCity: vi.fn(async (cityId: string) => {
      return locations
        .filter(
          (location) =>
            location.type === "DISTRICT" &&
            location.parentId === cityId &&
            location.isActive,
        )
        .map(
          (location): DistrictDto => ({
            id: location.id,
            name: location.name,
            code: location.code,
            cityId,
            sortOrder: location.sortOrder,
          }),
        );
    }),

    findAllDistricts: vi.fn(async () => {
      return locations
        .filter(
          (location) =>
            location.type === "DISTRICT" &&
            location.isActive &&
            location.parentId !== null,
        )
        .map(
          (location): DistrictDto => ({
            id: location.id,
            name: location.name,
            code: location.code,
            cityId: location.parentId as string,
            sortOrder: location.sortOrder,
          }),
        );
    }),

    findHotelsForDistrict: vi.fn(async (districtId: string) => {
      return locations
        .filter(
          (location) =>
            location.type === "HOTEL" &&
            location.parentId === districtId &&
            location.isActive,
        )
        .map(
          (location): HotelDto => ({
            id: location.id,
            name: location.name,
            address: location.address,
            districtId,
            sortOrder: location.sortOrder,
          }),
        );
    }),

    findAdminLocations: vi.fn(
      async (filters: {
        type?: LocationType;
        parentId?: string;
        cityId?: string;
        search?: string;
        includeInactive?: boolean;
        locale?: string;
      }) => {
        let rows = [...locations];

        if (filters.type) {
          rows = rows.filter((row) => row.type === filters.type);
        }

        if (filters.parentId) {
          rows = rows.filter((row) => row.parentId === filters.parentId);
        }

        if (!filters.includeInactive) {
          rows = rows.filter((row) => row.isActive);
        }

        if (filters.search) {
          const needle = filters.search.toLowerCase();

          rows = rows.filter(
            (row) =>
              row.name.toLowerCase().includes(needle) ||
              row.code.toLowerCase().includes(needle),
          );
        }

        if (filters.cityId && filters.type === "DISTRICT") {
          rows = rows.filter((row) => row.parentId === filters.cityId);
        }

        if (filters.cityId && filters.type === "HOTEL") {
          const districtIds = new Set(
            locations
              .filter(
                (row) =>
                  row.type === "DISTRICT" && row.parentId === filters.cityId,
              )
              .map((row) => row.id),
          );

          rows = rows.filter(
            (row) => row.parentId !== null && districtIds.has(row.parentId),
          );
        }

        return rows;
      },
    ),
  };

  return repo as unknown as LocationRepository;
}

export const antalyaHierarchySeed: SeedLocation[] = [
  {
    id: "city-antalya",
    type: "CITY",
    code: "antalya",
    name: "Antalya",
    parentId: null,
    address: null,
    latitude: null,
    longitude: null,
    sortOrder: 0,
    isActive: true,
  },
  {
    id: "airport-ayt",
    type: "AIRPORT",
    code: "AYT",
    name: "Antalya Airport",
    parentId: "city-antalya",
    address: null,
    latitude: null,
    longitude: null,
    sortOrder: 0,
    isActive: true,
  },
  {
    id: "district-belek",
    type: "DISTRICT",
    code: "belek",
    name: "Belek",
    parentId: "city-antalya",
    address: null,
    latitude: null,
    longitude: null,
    sortOrder: 0,
    isActive: true,
  },
  {
    id: "district-alanya",
    type: "DISTRICT",
    code: "alanya",
    name: "Alanya",
    parentId: "city-antalya",
    address: null,
    latitude: null,
    longitude: null,
    sortOrder: 1,
    isActive: true,
  },
  {
    id: "hotel-maxx",
    type: "HOTEL",
    code: "maxx-royal",
    name: "Maxx Royal",
    parentId: "district-belek",
    address: "Belek",
    latitude: null,
    longitude: null,
    sortOrder: 0,
    isActive: true,
  },
  {
    id: "hotel-regnum",
    type: "HOTEL",
    code: "regnum-carya",
    name: "Regnum Carya",
    parentId: "district-belek",
    address: "Belek",
    latitude: null,
    longitude: null,
    sortOrder: 1,
    isActive: true,
  },
  {
    id: "hotel-inactive",
    type: "HOTEL",
    code: "closed-hotel",
    name: "Closed Hotel",
    parentId: "district-belek",
    address: null,
    latitude: null,
    longitude: null,
    sortOrder: 2,
    isActive: false,
  },
  {
    id: "hotel-alanya",
    type: "HOTEL",
    code: "alanya-resort",
    name: "Alanya Resort",
    parentId: "district-alanya",
    address: "Alanya",
    latitude: null,
    longitude: null,
    sortOrder: 0,
    isActive: true,
  },
];
