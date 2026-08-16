import { Pool } from "@neondatabase/serverless";
import { and, eq, inArray, isNull, notInArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-serverless";

import * as schema from "../src/db/schema";
import {
  LEGACY_DISTRICT_TO_TRANSFER_ZONE,
  TRANSFER_ZONES,
} from "./data/transfer-zones";

const LOCALES = ["tr", "en", "de", "ru", "ar"] as const;
const VIP_VEHICLE_CODES = [
  "ULTRA_VIP_VITO",
  "ULTRA_MAYBACK_VIP_VITO",
] as const;
const MAYBACH_ONE_WAY_PREMIUM_EUR = 5;
const AIRPORT_CODE = "AYT";
const CITY_CODE = "ANTALYA";
const REGION_CODE = "ANTALYA";
const CURRENCY = "EUR";

const TRANSFER_ZONE_CODES = TRANSFER_ZONES.map((zone) => zone.code);
const FEATURED_ZONE_CODES = new Set([
  "KADRIYE_BELEK",
  "KEMER",
  "ALANYA_MERKEZ",
]);

function toMinor(eurMajor: number): number {
  return Math.round(eurMajor * 100);
}

async function upsertRoute(
  db: ReturnType<typeof drizzle>,
  originLocationId: string,
  destinationLocationId: string,
): Promise<string> {
  const [existing] = await db
    .select({ id: schema.routes.id })
    .from(schema.routes)
    .where(
      and(
        eq(schema.routes.originLocationId, originLocationId),
        eq(schema.routes.destinationLocationId, destinationLocationId),
      ),
    )
    .limit(1);

  if (existing) {
    await db
      .update(schema.routes)
      .set({ isActive: true, deletedAt: null })
      .where(eq(schema.routes.id, existing.id));
    return existing.id;
  }

  const [created] = await db
    .insert(schema.routes)
    .values({
      originLocationId,
      destinationLocationId,
    })
    .returning({ id: schema.routes.id });

  return created.id;
}

async function main(): Promise<void> {
  const pool = new Pool({
    connectionString:
      process.env.DATABASE_URL ??
      "postgresql://placeholder:placeholder@localhost/placeholder?sslmode=require",
  });
  const db = drizzle(pool, { schema });

  const [region] = await db
    .select({ id: schema.regions.id })
    .from(schema.regions)
    .where(eq(schema.regions.code, REGION_CODE))
    .limit(1);

  const [city] = await db
    .select({ id: schema.locations.id })
    .from(schema.locations)
    .where(eq(schema.locations.code, CITY_CODE))
    .limit(1);

  const [airport] = await db
    .select({ id: schema.locations.id })
    .from(schema.locations)
    .where(eq(schema.locations.code, AIRPORT_CODE))
    .limit(1);

  if (!region || !city || !airport) {
    throw new Error("Missing region, city, or airport seed data.");
  }

  const oldDistricts = await db
    .select({
      id: schema.locations.id,
      code: schema.locations.code,
    })
    .from(schema.locations)
    .where(
      and(
        eq(schema.locations.type, "DISTRICT"),
        isNull(schema.locations.deletedAt),
      ),
    );

  const zoneIdByCode = new Map<string, string>();

  for (const zone of TRANSFER_ZONES) {
    const [existing] = await db
      .select({ id: schema.locations.id })
      .from(schema.locations)
      .where(eq(schema.locations.code, zone.code))
      .limit(1);

    const isFeatured = FEATURED_ZONE_CODES.has(zone.code);

    let locationId = existing?.id;

    if (locationId) {
      await db
        .update(schema.locations)
        .set({
          parentId: city.id,
          regionId: region.id,
          type: "DISTRICT",
          defaultName: zone.defaultName,
          sortOrder: zone.sortOrder,
          isActive: true,
          deletedAt: null,
          isFeaturedOnHomepage: isFeatured,
        })
        .where(eq(schema.locations.id, locationId));
    } else {
      const [created] = await db
        .insert(schema.locations)
        .values({
          regionId: region.id,
          parentId: city.id,
          type: "DISTRICT",
          code: zone.code,
          defaultName: zone.defaultName,
          sortOrder: zone.sortOrder,
          isFeaturedOnHomepage: isFeatured,
        })
        .returning({ id: schema.locations.id });
      locationId = created.id;
    }

    zoneIdByCode.set(zone.code, locationId);

    for (const locale of LOCALES) {
      await db
        .insert(schema.locationTranslations)
        .values({
          locationId,
          locale,
          name: zone.names[locale],
          slug: zone.slug,
        })
        .onConflictDoUpdate({
          target: [
            schema.locationTranslations.locationId,
            schema.locationTranslations.locale,
          ],
          set: {
            name: zone.names[locale],
            slug: zone.slug,
          },
        });
    }

    if (isFeatured && zone.oneWayEur !== null) {
      await db
        .insert(schema.locationFeaturedPrices)
        .values({
          locationId,
          currency: CURRENCY,
          startingFromMinor: toMinor(zone.oneWayEur),
        })
        .onConflictDoUpdate({
          target: [
            schema.locationFeaturedPrices.locationId,
            schema.locationFeaturedPrices.currency,
          ],
          set: {
            startingFromMinor: toMinor(zone.oneWayEur),
          },
        });
    }
  }

  const legacyToZoneId = new Map<string, string>();
  for (const [legacyCode, zoneCode] of Object.entries(
    LEGACY_DISTRICT_TO_TRANSFER_ZONE,
  )) {
    const zoneId = zoneIdByCode.get(zoneCode);
    if (zoneId) {
      legacyToZoneId.set(legacyCode, zoneId);
    }
  }

  for (const oldDistrict of oldDistricts) {
    if (TRANSFER_ZONE_CODES.includes(oldDistrict.code)) {
      continue;
    }

    const targetZoneId = legacyToZoneId.get(oldDistrict.code);
    if (targetZoneId) {
      await db
        .update(schema.locations)
        .set({ parentId: targetZoneId })
        .where(
          and(
            eq(schema.locations.type, "HOTEL"),
            eq(schema.locations.parentId, oldDistrict.id),
          ),
        );

      await db
        .update(schema.reservations)
        .set({ dropoffLocationId: targetZoneId })
        .where(eq(schema.reservations.dropoffLocationId, oldDistrict.id));
    }

    await db
      .update(schema.locations)
      .set({
        code: `ARCHIVED_${oldDistrict.code}`,
        isActive: false,
        deletedAt: new Date(),
        isFeaturedOnHomepage: false,
      })
      .where(eq(schema.locations.id, oldDistrict.id));
  }

  const archivedDistrictIds = oldDistricts
    .filter((district) => !TRANSFER_ZONE_CODES.includes(district.code))
    .map((district) => district.id);

  if (archivedDistrictIds.length > 0) {
    const oldRoutes = await db
      .select({ id: schema.routes.id })
      .from(schema.routes)
      .where(inArray(schema.routes.destinationLocationId, archivedDistrictIds));

    const oldRouteIds = oldRoutes.map((route) => route.id);

    if (oldRouteIds.length > 0) {
      await db
        .update(schema.routePrices)
        .set({ isActive: false, deletedAt: new Date() })
        .where(inArray(schema.routePrices.routeId, oldRouteIds));

      await db
        .update(schema.routes)
        .set({ isActive: false, deletedAt: new Date() })
        .where(inArray(schema.routes.id, oldRouteIds));
    }
  }

  const vehicles = await db
    .select({
      id: schema.vehicleCategories.id,
      code: schema.vehicleCategories.code,
    })
    .from(schema.vehicleCategories)
    .where(isNull(schema.vehicleCategories.deletedAt));

  const vipVehicleIds = vehicles
    .filter((vehicle) =>
      VIP_VEHICLE_CODES.includes(
        vehicle.code as (typeof VIP_VEHICLE_CODES)[number],
      ),
    )
    .map((vehicle) => vehicle.id);

  const vipVehicleCodeById = new Map(
    vehicles
      .filter((vehicle) =>
        VIP_VEHICLE_CODES.includes(
          vehicle.code as (typeof VIP_VEHICLE_CODES)[number],
        ),
      )
      .map((vehicle) => [vehicle.id, vehicle.code]),
  );

  const nonVipVehicleIds = vehicles
    .filter(
      (vehicle) =>
        !VIP_VEHICLE_CODES.includes(
          vehicle.code as (typeof VIP_VEHICLE_CODES)[number],
        ),
    )
    .map((vehicle) => vehicle.id);

  if (vipVehicleIds.length !== VIP_VEHICLE_CODES.length) {
    throw new Error("VIP vehicles not found in database.");
  }

  const newZoneIds = [...zoneIdByCode.values()];
  const newRoutes = await db
    .select({ id: schema.routes.id })
    .from(schema.routes)
    .where(inArray(schema.routes.destinationLocationId, newZoneIds));

  const newRouteIds = newRoutes.map((route) => route.id);

  if (newRouteIds.length > 0) {
    await db
      .update(schema.routePrices)
      .set({ isActive: false, deletedAt: new Date() })
      .where(inArray(schema.routePrices.routeId, newRouteIds));
  }

  if (nonVipVehicleIds.length > 0) {
    await db
      .update(schema.routePrices)
      .set({ isActive: false, deletedAt: new Date() })
      .where(inArray(schema.routePrices.vehicleCategoryId, nonVipVehicleIds));
  }

  for (const zone of TRANSFER_ZONES) {
    const zoneId = zoneIdByCode.get(zone.code);
    if (!zoneId) {
      continue;
    }

    const routeId = await upsertRoute(db, airport.id, zoneId);

    for (const vehicleId of vipVehicleIds) {
      const vehicleCode = vipVehicleCodeById.get(vehicleId);
      const [existingPrice] = await db
        .select({ id: schema.routePrices.id })
        .from(schema.routePrices)
        .where(
          and(
            eq(schema.routePrices.routeId, routeId),
            eq(schema.routePrices.vehicleCategoryId, vehicleId),
            eq(schema.routePrices.currency, CURRENCY),
          ),
        )
        .limit(1);

      if (zone.oneWayEur === null) {
        if (existingPrice) {
          await db
            .update(schema.routePrices)
            .set({ isActive: false, deletedAt: new Date() })
            .where(eq(schema.routePrices.id, existingPrice.id));
        }
        continue;
      }

      const oneWayEur =
        vehicleCode === "ULTRA_MAYBACK_VIP_VITO"
          ? zone.oneWayEur + MAYBACH_ONE_WAY_PREMIUM_EUR
          : zone.oneWayEur;
      const oneWayMinor = toMinor(oneWayEur);
      const roundTripMinor = oneWayMinor * 2;

      if (existingPrice) {
        await db
          .update(schema.routePrices)
          .set({
            oneWayPriceMinor: oneWayMinor,
            roundTripPriceMinor: roundTripMinor,
            currency: CURRENCY,
            isActive: true,
            deletedAt: null,
          })
          .where(eq(schema.routePrices.id, existingPrice.id));
      } else {
        await db.insert(schema.routePrices).values({
          routeId,
          vehicleCategoryId: vehicleId,
          oneWayPriceMinor: oneWayMinor,
          roundTripPriceMinor: roundTripMinor,
          currency: CURRENCY,
        });
      }
    }

    const priceLabel =
      zone.oneWayEur === null
        ? "null"
        : `€${zone.oneWayEur} / €${zone.oneWayEur * 2}`;
    console.log(`${zone.code.padEnd(22)} ${priceLabel}`);
  }

  const strayDistricts = await db
    .select({ code: schema.locations.code })
    .from(schema.locations)
    .where(
      and(
        eq(schema.locations.type, "DISTRICT"),
        isNull(schema.locations.deletedAt),
        notInArray(schema.locations.code, TRANSFER_ZONE_CODES),
      ),
    );

  if (strayDistricts.length > 0) {
    console.warn(
      "Unexpected active districts remain:",
      strayDistricts.map((district) => district.code).join(", "),
    );
  }

  console.log(`\nTransfer zones ready: ${TRANSFER_ZONES.length} active districts.`);
  await pool.end();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
