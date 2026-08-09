import "server-only";

import { and, asc, eq, min, sql } from "drizzle-orm";

import type { Database } from "@/db/client";
import {
  locationFeaturedPrices,
  locationTranslations,
  locations,
  routePrices,
  vehicleCategories,
  vehicleCategoryTranslations,
} from "@/db/schema";
import type {
  DistrictStartingPriceDto,
  FleetVehicleDto,
  FleetVehicleDetailDto,
} from "@/features/marketing/types";

function translatedName(
  defaultName: string,
  translatedNameValue: string | null,
): string {
  return translatedNameValue ?? defaultName;
}

export class MarketingRepository {
  constructor(private readonly database: Database) {}

  async findFeaturedDistricts(
    locale: string,
    currency: string,
  ): Promise<DistrictStartingPriceDto[]> {
    const rows = await this.database
      .select({
        id: locations.id,
        code: locations.code,
        defaultName: locations.defaultName,
        translatedName: locationTranslations.name,
        imageKey: locations.imageKey,
        startingFromMinor: locationFeaturedPrices.startingFromMinor,
        sortOrder: locations.sortOrder,
      })
      .from(locations)
      .innerJoin(
        locationFeaturedPrices,
        and(
          eq(locationFeaturedPrices.locationId, locations.id),
          eq(locationFeaturedPrices.currency, currency),
        ),
      )
      .leftJoin(
        locationTranslations,
        and(
          eq(locationTranslations.locationId, locations.id),
          eq(locationTranslations.locale, locale),
        ),
      )
      .where(
        and(
          eq(locations.type, "DISTRICT"),
          eq(locations.isActive, true),
          eq(locations.isFeaturedOnHomepage, true),
          sql`${locations.imageKey} IS NOT NULL`,
          sql`trim(${locations.imageKey}) <> ''`,
        ),
      )
      .orderBy(asc(locations.sortOrder), asc(locations.defaultName));

    return rows.map((row) => ({
      id: row.id,
      name: translatedName(row.defaultName, row.translatedName),
      code: row.code,
      imageKey: row.imageKey!.trim(),
      startingFromMinor: row.startingFromMinor,
      currency,
    }));
  }

  async findFleetStartingPrices(locale: string): Promise<FleetVehicleDto[]> {
    const rows = await this.database
      .select({
        id: vehicleCategories.id,
        code: vehicleCategories.code,
        defaultName: vehicleCategories.defaultName,
        translatedName: vehicleCategoryTranslations.name,
        passengerCapacity: vehicleCategories.passengerCapacity,
        largeLuggageCapacity: vehicleCategories.largeLuggageCapacity,
        cabinLuggageCapacity: vehicleCategories.cabinLuggageCapacity,
        imageKey: vehicleCategories.imageKey,
        startingFromMinor: min(routePrices.oneWayPriceMinor),
        currency: sql<string>`min(${routePrices.currency})`,
        sortOrder: vehicleCategories.sortOrder,
      })
      .from(vehicleCategories)
      .innerJoin(
        routePrices,
        and(
          eq(routePrices.vehicleCategoryId, vehicleCategories.id),
          eq(routePrices.isActive, true),
        ),
      )
      .leftJoin(
        vehicleCategoryTranslations,
        and(
          eq(
            vehicleCategoryTranslations.vehicleCategoryId,
            vehicleCategories.id,
          ),
          eq(vehicleCategoryTranslations.locale, locale),
        ),
      )
      .where(eq(vehicleCategories.isActive, true))
      .groupBy(
        vehicleCategories.id,
        vehicleCategories.code,
        vehicleCategories.defaultName,
        vehicleCategoryTranslations.name,
        vehicleCategories.passengerCapacity,
        vehicleCategories.largeLuggageCapacity,
        vehicleCategories.cabinLuggageCapacity,
        vehicleCategories.imageKey,
        vehicleCategories.sortOrder,
      )
      .orderBy(asc(vehicleCategories.sortOrder));

    return rows.map((row) => ({
      id: row.id,
      name: translatedName(row.defaultName, row.translatedName),
      code: row.code,
      passengerCapacity: row.passengerCapacity,
      largeLuggageCapacity: row.largeLuggageCapacity,
      cabinLuggageCapacity: row.cabinLuggageCapacity,
      imageKey: row.imageKey,
      startingFromMinor: Number(row.startingFromMinor ?? 0),
      currency: row.currency ?? "EUR",
    }));
  }

  async findActiveFleetCodes(): Promise<string[]> {
    const rows = await this.database
      .select({ code: vehicleCategories.code })
      .from(vehicleCategories)
      .where(eq(vehicleCategories.isActive, true))
      .orderBy(asc(vehicleCategories.sortOrder));

    return rows.map((row) => row.code);
  }

  async findFleetVehicleByCode(
    code: string,
    locale: string,
  ): Promise<Omit<
    FleetVehicleDetailDto,
    "features" | "galleryImageKeys"
  > | null> {
    const [row] = await this.database
      .select({
        id: vehicleCategories.id,
        code: vehicleCategories.code,
        defaultName: vehicleCategories.defaultName,
        translatedName: vehicleCategoryTranslations.name,
        brand: vehicleCategories.brand,
        model: vehicleCategories.model,
        shortDescription: vehicleCategoryTranslations.shortDescription,
        description: vehicleCategoryTranslations.description,
        passengerCapacity: vehicleCategories.passengerCapacity,
        largeLuggageCapacity: vehicleCategories.largeLuggageCapacity,
        cabinLuggageCapacity: vehicleCategories.cabinLuggageCapacity,
        imageKey: vehicleCategories.imageKey,
        startingFromMinor: min(routePrices.oneWayPriceMinor),
        currency: sql<string>`min(${routePrices.currency})`,
      })
      .from(vehicleCategories)
      .innerJoin(
        routePrices,
        and(
          eq(routePrices.vehicleCategoryId, vehicleCategories.id),
          eq(routePrices.isActive, true),
        ),
      )
      .leftJoin(
        vehicleCategoryTranslations,
        and(
          eq(
            vehicleCategoryTranslations.vehicleCategoryId,
            vehicleCategories.id,
          ),
          eq(vehicleCategoryTranslations.locale, locale),
        ),
      )
      .where(
        and(
          eq(vehicleCategories.isActive, true),
          eq(vehicleCategories.code, code),
        ),
      )
      .groupBy(
        vehicleCategories.id,
        vehicleCategories.code,
        vehicleCategories.defaultName,
        vehicleCategoryTranslations.name,
        vehicleCategories.brand,
        vehicleCategories.model,
        vehicleCategoryTranslations.shortDescription,
        vehicleCategoryTranslations.description,
        vehicleCategories.passengerCapacity,
        vehicleCategories.largeLuggageCapacity,
        vehicleCategories.cabinLuggageCapacity,
        vehicleCategories.imageKey,
      )
      .limit(1);

    if (!row) {
      return null;
    }

    return {
      id: row.id,
      name: translatedName(row.defaultName, row.translatedName),
      code: row.code,
      brand: row.brand,
      model: row.model,
      shortDescription: row.shortDescription,
      description: row.description,
      passengerCapacity: row.passengerCapacity,
      largeLuggageCapacity: row.largeLuggageCapacity,
      cabinLuggageCapacity: row.cabinLuggageCapacity,
      imageKey: row.imageKey,
      startingFromMinor: Number(row.startingFromMinor ?? 0),
      currency: row.currency ?? "EUR",
    };
  }
}
