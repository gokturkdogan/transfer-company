import "server-only";

import { and, eq, inArray } from "drizzle-orm";

import type { Database } from "@/db/client";
import {
  extraServiceTranslations,
  extraServices,
  routePrices,
  routes,
  vehicleCategories,
  vehicleCategoryTranslations,
} from "@/db/schema";
import type {
  ExtraServiceWithTranslation,
  PricingReader,
  VehicleOptionRecord,
} from "@/features/pricing/server/reader";

export class PricingRepository implements PricingReader {
  constructor(private readonly database: Database) {}

  async findRouteById(routeId: string) {
    const [route] = await this.database
      .select({
        id: routes.id,
        originLocationId: routes.originLocationId,
        destinationLocationId: routes.destinationLocationId,
        isActive: routes.isActive,
      })
      .from(routes)
      .where(eq(routes.id, routeId))
      .limit(1);

    return route ?? null;
  }

  async findActiveRouteByAirportAndDistrict(
    originAirportId: string,
    destinationDistrictId: string,
  ) {
    const [route] = await this.database
      .select({
        id: routes.id,
        originLocationId: routes.originLocationId,
        destinationLocationId: routes.destinationLocationId,
        isActive: routes.isActive,
      })
      .from(routes)
      .where(
        and(
          eq(routes.originLocationId, originAirportId),
          eq(routes.destinationLocationId, destinationDistrictId),
          eq(routes.isActive, true),
        ),
      )
      .limit(1);

    return route ?? null;
  }

  /** @deprecated Use findActiveRouteByAirportAndDistrict */
  async findActiveRouteByLocations(
    pickupLocationId: string,
    dropoffLocationId: string,
  ) {
    return this.findActiveRouteByAirportAndDistrict(
      pickupLocationId,
      dropoffLocationId,
    );
  }

  async findRoutePrice(routeId: string, vehicleCategoryId: string) {
    const [price] = await this.database
      .select({
        routeId: routePrices.routeId,
        vehicleCategoryId: routePrices.vehicleCategoryId,
        oneWayPriceMinor: routePrices.oneWayPriceMinor,
        roundTripPriceMinor: routePrices.roundTripPriceMinor,
        currency: routePrices.currency,
        isActive: routePrices.isActive,
      })
      .from(routePrices)
      .where(
        and(
          eq(routePrices.routeId, routeId),
          eq(routePrices.vehicleCategoryId, vehicleCategoryId),
        ),
      )
      .limit(1);

    return price ?? null;
  }

  async findVehicleCategoryById(vehicleCategoryId: string) {
    const [category] = await this.database
      .select({
        id: vehicleCategories.id,
        isActive: vehicleCategories.isActive,
        passengerCapacity: vehicleCategories.passengerCapacity,
        largeLuggageCapacity: vehicleCategories.largeLuggageCapacity,
        cabinLuggageCapacity: vehicleCategories.cabinLuggageCapacity,
        defaultName: vehicleCategories.defaultName,
      })
      .from(vehicleCategories)
      .where(eq(vehicleCategories.id, vehicleCategoryId))
      .limit(1);

    return category ?? null;
  }

  async findVehicleCategoryTranslation(
    vehicleCategoryId: string,
    locale: string,
  ) {
    const [translation] = await this.database
      .select({ name: vehicleCategoryTranslations.name })
      .from(vehicleCategoryTranslations)
      .where(
        and(
          eq(vehicleCategoryTranslations.vehicleCategoryId, vehicleCategoryId),
          eq(vehicleCategoryTranslations.locale, locale),
        ),
      )
      .limit(1);

    return translation ?? null;
  }

  async findVehicleOptionsForRoute(
    routeId: string,
    locale: string,
  ): Promise<VehicleOptionRecord[]> {
    const rows = await this.database
      .select({
        id: vehicleCategories.id,
        isActive: vehicleCategories.isActive,
        defaultName: vehicleCategories.defaultName,
        passengerCapacity: vehicleCategories.passengerCapacity,
        largeLuggageCapacity: vehicleCategories.largeLuggageCapacity,
        cabinLuggageCapacity: vehicleCategories.cabinLuggageCapacity,
        sortOrder: vehicleCategories.sortOrder,
        translatedName: vehicleCategoryTranslations.name,
        oneWayPriceMinor: routePrices.oneWayPriceMinor,
        roundTripPriceMinor: routePrices.roundTripPriceMinor,
        currency: routePrices.currency,
        priceIsActive: routePrices.isActive,
      })
      .from(routePrices)
      .innerJoin(
        vehicleCategories,
        eq(routePrices.vehicleCategoryId, vehicleCategories.id),
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
          eq(routePrices.routeId, routeId),
          eq(routePrices.isActive, true),
          eq(vehicleCategories.isActive, true),
        ),
      );

    return rows;
  }

  async findExtraServiceById(extraServiceId: string) {
    const [extra] = await this.database
      .select({
        id: extraServices.id,
        code: extraServices.code,
        pricingMode: extraServices.pricingMode,
        priceMinor: extraServices.priceMinor,
        currency: extraServices.currency,
        customerSelectable: extraServices.customerSelectable,
        autoSuggested: extraServices.autoSuggested,
        minQuantity: extraServices.minQuantity,
        maxQuantity: extraServices.maxQuantity,
        luggageCapacityPerUnit: extraServices.luggageCapacityPerUnit,
        isActive: extraServices.isActive,
        translatedName: extraServiceTranslations.name,
      })
      .from(extraServices)
      .leftJoin(
        extraServiceTranslations,
        eq(extraServiceTranslations.extraServiceId, extraServices.id),
      )
      .where(eq(extraServices.id, extraServiceId))
      .limit(1);

    return extra ?? null;
  }

  async findExtraServiceTranslation(extraServiceId: string, locale: string) {
    const [translation] = await this.database
      .select({ name: extraServiceTranslations.name })
      .from(extraServiceTranslations)
      .where(
        and(
          eq(extraServiceTranslations.extraServiceId, extraServiceId),
          eq(extraServiceTranslations.locale, locale),
        ),
      )
      .limit(1);

    return translation ?? null;
  }

  async findExtraServicesByIds(
    extraServiceIds: string[],
    locale: string,
  ): Promise<ExtraServiceWithTranslation[]> {
    if (extraServiceIds.length === 0) {
      return [];
    }

    return this.database
      .select({
        id: extraServices.id,
        code: extraServices.code,
        pricingMode: extraServices.pricingMode,
        priceMinor: extraServices.priceMinor,
        currency: extraServices.currency,
        customerSelectable: extraServices.customerSelectable,
        autoSuggested: extraServices.autoSuggested,
        minQuantity: extraServices.minQuantity,
        maxQuantity: extraServices.maxQuantity,
        luggageCapacityPerUnit: extraServices.luggageCapacityPerUnit,
        isActive: extraServices.isActive,
        translatedName: extraServiceTranslations.name,
      })
      .from(extraServices)
      .leftJoin(
        extraServiceTranslations,
        and(
          eq(extraServiceTranslations.extraServiceId, extraServices.id),
          eq(extraServiceTranslations.locale, locale),
        ),
      )
      .where(inArray(extraServices.id, extraServiceIds));
  }

  async findCustomerSelectableExtras(locale: string) {
    return this.database
      .select({
        id: extraServices.id,
        code: extraServices.code,
        pricingMode: extraServices.pricingMode,
        priceMinor: extraServices.priceMinor,
        currency: extraServices.currency,
        customerSelectable: extraServices.customerSelectable,
        autoSuggested: extraServices.autoSuggested,
        minQuantity: extraServices.minQuantity,
        maxQuantity: extraServices.maxQuantity,
        luggageCapacityPerUnit: extraServices.luggageCapacityPerUnit,
        isActive: extraServices.isActive,
        translatedName: extraServiceTranslations.name,
      })
      .from(extraServices)
      .leftJoin(
        extraServiceTranslations,
        and(
          eq(extraServiceTranslations.extraServiceId, extraServices.id),
          eq(extraServiceTranslations.locale, locale),
        ),
      )
      .where(
        and(
          eq(extraServices.isActive, true),
          eq(extraServices.customerSelectable, true),
        ),
      );
  }

  async findLuggageVehicleExtras() {
    return this.database
      .select({
        id: extraServices.id,
        code: extraServices.code,
        pricingMode: extraServices.pricingMode,
        priceMinor: extraServices.priceMinor,
        currency: extraServices.currency,
        customerSelectable: extraServices.customerSelectable,
        autoSuggested: extraServices.autoSuggested,
        minQuantity: extraServices.minQuantity,
        maxQuantity: extraServices.maxQuantity,
        luggageCapacityPerUnit: extraServices.luggageCapacityPerUnit,
        isActive: extraServices.isActive,
        translatedName: extraServiceTranslations.name,
      })
      .from(extraServices)
      .where(
        and(
          eq(extraServices.isActive, true),
          eq(extraServices.autoSuggested, true),
        ),
      );
  }
}
