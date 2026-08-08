import "server-only";

import { and, asc, eq, min, sql } from "drizzle-orm";

import type { Database } from "@/db/client";
import {
  locationTranslations,
  locations,
  routePrices,
  routes,
  vehicleCategories,
  vehicleCategoryTranslations,
} from "@/db/schema";
import type {
  DistrictStartingPriceDto,
  FleetVehicleDto,
} from "@/features/marketing/types";
import { VehicleFeatureRepository } from "@/features/vehicles/server/feature-repository";

function translatedName(
  defaultName: string,
  translatedNameValue: string | null,
): string {
  return translatedNameValue ?? defaultName;
}

export class MarketingRepository {
  private readonly vehicleFeatureRepository: VehicleFeatureRepository;

  constructor(private readonly database: Database) {
    this.vehicleFeatureRepository = new VehicleFeatureRepository(database);
  }

  async findDistrictStartingPrices(
    originAirportCode: string,
    locale: string,
  ): Promise<DistrictStartingPriceDto[]> {
    const originAirport = this.database
      .select({ id: locations.id })
      .from(locations)
      .where(
        and(
          eq(locations.code, originAirportCode),
          eq(locations.type, "AIRPORT"),
          eq(locations.isActive, true),
        ),
      )
      .as("origin_airport");

    const rows = await this.database
      .select({
        id: locations.id,
        code: locations.code,
        defaultName: locations.defaultName,
        translatedName: locationTranslations.name,
        startingFromMinor: min(routePrices.oneWayPriceMinor),
        currency: sql<string>`min(${routePrices.currency})`,
        sortOrder: locations.sortOrder,
      })
      .from(routes)
      .innerJoin(originAirport, eq(routes.originLocationId, originAirport.id))
      .innerJoin(locations, eq(routes.destinationLocationId, locations.id))
      .innerJoin(
        routePrices,
        and(
          eq(routePrices.routeId, routes.id),
          eq(routePrices.isActive, true),
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
          eq(routes.isActive, true),
          eq(locations.type, "DISTRICT"),
          eq(locations.isActive, true),
        ),
      )
      .groupBy(
        locations.id,
        locations.code,
        locations.defaultName,
        locationTranslations.name,
        locations.sortOrder,
      )
      .orderBy(asc(locations.sortOrder));

    return rows.map((row) => ({
      id: row.id,
      name: translatedName(row.defaultName, row.translatedName),
      code: row.code,
      startingFromMinor: Number(row.startingFromMinor ?? 0),
      currency: row.currency ?? "EUR",
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

    const featuresByVehicle =
      await this.vehicleFeatureRepository.listLabelsByVehicleIds(
        rows.map((row) => row.id),
        locale,
      );

    return rows.map((row) => ({
      id: row.id,
      name: translatedName(row.defaultName, row.translatedName),
      code: row.code,
      passengerCapacity: row.passengerCapacity,
      largeLuggageCapacity: row.largeLuggageCapacity,
      cabinLuggageCapacity: row.cabinLuggageCapacity,
      imageKey: row.imageKey,
      features: featuresByVehicle.get(row.id) ?? [],
      startingFromMinor: Number(row.startingFromMinor ?? 0),
      currency: row.currency ?? "EUR",
    }));
  }
}
