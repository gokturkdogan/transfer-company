import "server-only";

import { and, asc, eq, ilike, or, sql } from "drizzle-orm";

import type { Database } from "@/db/client";
import type { LocationType } from "@/db/schema/enums";
import { locationTranslations, locations } from "@/db/schema";
import type {
  AirportDto,
  CityDto,
  DistrictDto,
  HotelDto,
  LocationRecordDto,
} from "@/features/locations/types";

function translatedName(
  defaultName: string,
  translatedNameValue: string | null,
): string {
  return translatedNameValue ?? defaultName;
}

export class LocationRepository {
  constructor(private readonly database: Database) {}

  private baseSelect(locale: string) {
    return this.database
      .select({
        id: locations.id,
        type: locations.type,
        code: locations.code,
        defaultName: locations.defaultName,
        parentId: locations.parentId,
        address: locations.address,
        latitude: locations.latitude,
        longitude: locations.longitude,
        sortOrder: locations.sortOrder,
        isActive: locations.isActive,
        translatedName: locationTranslations.name,
      })
      .from(locations)
      .leftJoin(
        locationTranslations,
        and(
          eq(locationTranslations.locationId, locations.id),
          eq(locationTranslations.locale, locale),
        ),
      );
  }

  async findById(id: string, locale: string): Promise<LocationRecordDto | null> {
    const [row] = await this.baseSelect(locale)
      .where(eq(locations.id, id))
      .limit(1);

    if (!row) {
      return null;
    }

    return this.toRecord(row);
  }

  async findAirports(locale: string): Promise<AirportDto[]> {
    const rows = await this.baseSelect(locale)
      .where(and(eq(locations.type, "AIRPORT"), eq(locations.isActive, true)))
      .orderBy(asc(locations.sortOrder), asc(locations.defaultName));

    return rows.map((row) => ({
      id: row.id,
      name: translatedName(row.defaultName, row.translatedName),
      code: row.code,
      cityId: row.parentId,
      sortOrder: row.sortOrder,
    }));
  }

  async findCities(locale: string): Promise<CityDto[]> {
    const rows = await this.baseSelect(locale)
      .where(and(eq(locations.type, "CITY"), eq(locations.isActive, true)))
      .orderBy(asc(locations.sortOrder), asc(locations.defaultName));

    return rows.map((row) => ({
      id: row.id,
      name: translatedName(row.defaultName, row.translatedName),
      code: row.code,
      sortOrder: row.sortOrder,
    }));
  }

  async findDistrictsForCity(
    cityId: string,
    locale: string,
  ): Promise<DistrictDto[]> {
    const rows = await this.baseSelect(locale)
      .where(
        and(
          eq(locations.type, "DISTRICT"),
          eq(locations.parentId, cityId),
          eq(locations.isActive, true),
        ),
      )
      .orderBy(asc(locations.sortOrder), asc(locations.defaultName));

    return rows.map((row) => ({
      id: row.id,
      name: translatedName(row.defaultName, row.translatedName),
      code: row.code,
      cityId,
      sortOrder: row.sortOrder,
    }));
  }

  async findAllDistricts(locale: string): Promise<DistrictDto[]> {
    const rows = await this.baseSelect(locale)
      .where(and(eq(locations.type, "DISTRICT"), eq(locations.isActive, true)))
      .orderBy(asc(locations.sortOrder), asc(locations.defaultName));

    return rows.flatMap((row) => {
      if (row.parentId === null) {
        return [];
      }

      return [
        {
          id: row.id,
          name: translatedName(row.defaultName, row.translatedName),
          code: row.code,
          cityId: row.parentId,
          sortOrder: row.sortOrder,
        },
      ];
    });
  }

  async findHotelsForDistrict(
    districtId: string,
    locale: string,
  ): Promise<HotelDto[]> {
    const rows = await this.baseSelect(locale)
      .where(
        and(
          eq(locations.type, "HOTEL"),
          eq(locations.parentId, districtId),
          eq(locations.isActive, true),
        ),
      )
      .orderBy(asc(locations.sortOrder), asc(locations.defaultName));

    return rows.map((row) => ({
      id: row.id,
      name: translatedName(row.defaultName, row.translatedName),
      address: row.address,
      districtId,
      sortOrder: row.sortOrder,
    }));
  }

  async findAdminLocations(filters: {
    type?: LocationType;
    parentId?: string;
    cityId?: string;
    search?: string;
    includeInactive?: boolean;
    locale?: string;
  }): Promise<LocationRecordDto[]> {
    const locale = filters.locale ?? "en";
    const conditions = [];

    if (filters.type) {
      conditions.push(eq(locations.type, filters.type));
    }

    if (filters.parentId) {
      conditions.push(eq(locations.parentId, filters.parentId));
    }

    if (!filters.includeInactive) {
      conditions.push(eq(locations.isActive, true));
    }

    if (filters.search) {
      conditions.push(
        or(
          ilike(locations.defaultName, `%${filters.search}%`),
          ilike(locations.code, `%${filters.search}%`),
        ),
      );
    }

    const query = this.baseSelect(locale);

    if (filters.cityId && filters.type === "DISTRICT") {
      conditions.push(eq(locations.parentId, filters.cityId));
    }

    if (filters.cityId && filters.type === "HOTEL") {
      const districtIds = await this.database
        .select({ id: locations.id })
        .from(locations)
        .where(
          and(
            eq(locations.type, "DISTRICT"),
            eq(locations.parentId, filters.cityId),
          ),
        );

      if (districtIds.length === 0) {
        return [];
      }

      conditions.push(
        sql`${locations.parentId} IN (${sql.join(
          districtIds.map((district) => sql`${district.id}`),
          sql`, `,
        )})`,
      );
    }

    const rows = await query
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(asc(locations.type), asc(locations.sortOrder));

    return rows.map((row) => this.toRecord(row));
  }

  private toRecord(row: {
    id: string;
    type: LocationType;
    code: string;
    defaultName: string;
    parentId: string | null;
    address: string | null;
    latitude: number | null;
    longitude: number | null;
    sortOrder: number;
    isActive: boolean;
    translatedName: string | null;
  }): LocationRecordDto {
    return {
      id: row.id,
      type: row.type,
      code: row.code,
      name: translatedName(row.defaultName, row.translatedName),
      parentId: row.parentId,
      address: row.address,
      latitude: row.latitude,
      longitude: row.longitude,
      sortOrder: row.sortOrder,
      isActive: row.isActive,
    };
  }
}
