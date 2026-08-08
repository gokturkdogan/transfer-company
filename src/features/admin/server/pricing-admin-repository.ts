import "server-only";

import { and, asc, eq, inArray } from "drizzle-orm";

import { DEFAULT_CURRENCY } from "@/config/constants";
import type { Database } from "@/db/client";
import { routePrices, routes, vehicleCategories } from "@/db/schema";

type DbExecutor = Database | Parameters<Parameters<Database["transaction"]>[0]>[0];

export type AdminVehicleCategory = {
  id: string;
  code: string;
  defaultName: string;
  sortOrder: number;
};

export type AdminRoutePriceCell = {
  vehicleCategoryId: string;
  currency: string;
  oneWayPriceMinor: number | null;
  roundTripPriceMinor: number | null;
  isActive: boolean;
};

export type AdminDistrictRoutePrice = {
  districtId: string;
  districtName: string;
  districtCode: string;
  routeId: string | null;
  prices: AdminRoutePriceCell[];
};

export type UpsertRoutePriceInput = {
  districtId: string;
  vehicleCategoryId: string;
  currency: string;
  oneWayPriceMinor: number;
  roundTripPriceMinor?: number | null;
};

export class PricingAdminRepository {
  constructor(private readonly database: Database) {}

  async listVehicleCategories(): Promise<AdminVehicleCategory[]> {
    return this.database
      .select({
        id: vehicleCategories.id,
        code: vehicleCategories.code,
        defaultName: vehicleCategories.defaultName,
        sortOrder: vehicleCategories.sortOrder,
      })
      .from(vehicleCategories)
      .where(eq(vehicleCategories.isActive, true))
      .orderBy(asc(vehicleCategories.sortOrder));
  }

  async listDistrictRoutePrices(
    airportId: string,
    districts: Array<{ id: string; defaultName: string; code: string }>,
    vehicleCategoryIds: string[],
    enabledCurrencies: string[],
  ): Promise<AdminDistrictRoutePrice[]> {
    if (districts.length === 0 || enabledCurrencies.length === 0) {
      return [];
    }

    const routeRows = await this.database
      .select({
        id: routes.id,
        destinationLocationId: routes.destinationLocationId,
      })
      .from(routes)
      .where(
        and(
          eq(routes.originLocationId, airportId),
          eq(routes.isActive, true),
        ),
      );

    const routeByDistrict = new Map(
      routeRows.map((route) => [route.destinationLocationId, route.id]),
    );

    const routeIds = routeRows.map((route) => route.id);
    const priceRows =
      routeIds.length === 0
        ? []
        : await this.database
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
                inArray(routePrices.routeId, routeIds),
                inArray(routePrices.currency, enabledCurrencies),
                eq(routePrices.isActive, true),
              ),
            );

    const pricesByRoute = new Map<
      string,
      Map<string, (typeof priceRows)[number]>
    >();

    for (const price of priceRows) {
      const routePricesMap =
        pricesByRoute.get(price.routeId) ??
        new Map<string, (typeof priceRows)[number]>();
      routePricesMap.set(
        `${price.vehicleCategoryId}:${price.currency}`,
        price,
      );
      pricesByRoute.set(price.routeId, routePricesMap);
    }

    return districts.map((district) => {
      const routeId = routeByDistrict.get(district.id) ?? null;
      const routePriceMap = routeId ? pricesByRoute.get(routeId) : undefined;
      const prices: AdminRoutePriceCell[] = [];

      for (const vehicleCategoryId of vehicleCategoryIds) {
        for (const currency of enabledCurrencies) {
          const price = routePriceMap?.get(`${vehicleCategoryId}:${currency}`);

          prices.push({
            vehicleCategoryId,
            currency,
            oneWayPriceMinor: price?.oneWayPriceMinor ?? null,
            roundTripPriceMinor: price?.roundTripPriceMinor ?? null,
            isActive: price?.isActive ?? false,
          });
        }
      }

      return {
        districtId: district.id,
        districtName: district.defaultName,
        districtCode: district.code,
        routeId,
        prices,
      };
    });
  }

  private async findOrCreateRoute(
    executor: DbExecutor,
    airportId: string,
    districtId: string,
  ): Promise<string> {
    const [existing] = await executor
      .select({ id: routes.id })
      .from(routes)
      .where(
        and(
          eq(routes.originLocationId, airportId),
          eq(routes.destinationLocationId, districtId),
        ),
      )
      .limit(1);

    if (existing) {
      await executor
        .update(routes)
        .set({ isActive: true, deletedAt: null })
        .where(eq(routes.id, existing.id));

      return existing.id;
    }

    const [created] = await executor
      .insert(routes)
      .values({
        originLocationId: airportId,
        destinationLocationId: districtId,
      })
      .returning({ id: routes.id });

    return created.id;
  }

  async upsertRoutePrices(
    airportId: string,
    prices: UpsertRoutePriceInput[],
  ): Promise<void> {
    if (prices.length === 0) {
      return;
    }

    await this.database.transaction(async (tx) => {
      for (const price of prices) {
        const routeId = await this.findOrCreateRoute(
          tx,
          airportId,
          price.districtId,
        );

        const currency = price.currency || DEFAULT_CURRENCY;

        const [existing] = await tx
          .select({ id: routePrices.id })
          .from(routePrices)
          .where(
            and(
              eq(routePrices.routeId, routeId),
              eq(routePrices.vehicleCategoryId, price.vehicleCategoryId),
              eq(routePrices.currency, currency),
            ),
          )
          .limit(1);

        if (existing) {
          await tx
            .update(routePrices)
            .set({
              oneWayPriceMinor: price.oneWayPriceMinor,
              roundTripPriceMinor: price.roundTripPriceMinor ?? null,
              currency,
              isActive: true,
              deletedAt: null,
            })
            .where(eq(routePrices.id, existing.id));
          continue;
        }

        await tx.insert(routePrices).values({
          routeId,
          vehicleCategoryId: price.vehicleCategoryId,
          oneWayPriceMinor: price.oneWayPriceMinor,
          roundTripPriceMinor: price.roundTripPriceMinor ?? null,
          currency,
        });
      }
    });
  }
}
