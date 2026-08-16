import { Pool } from "@neondatabase/serverless";
import { and, eq, inArray, isNull } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-serverless";

import * as schema from "../src/db/schema";

const AIRPORT_CODE = "AYT";
const CURRENCY = "EUR";

const SALES_TIER_PREMIUM_EUR = 5;

/** Ultra VIP Vito — AYT → transfer zone one-way EUR (major units). */
const VITO_ZONE_ONE_WAY_EUR: Record<string, number> = {
  KUNDU_LARA: 40,
  KALE_ICI: 40,
  KONYAALTI: 45,
  KADRIYE_BELEK: 55,
  BOGAZKENT: 55,
  COLAKLI_SIDE: 55,
  SORGUN: 60,
  BELDIBI_GOYNUK: 60,
  KEMER: 65,
  KIZILAGAC_KIZILOT: 70,
  CAMYUVA_KIRIS: 70,
  OKURCALAR_AVSALLAR: 80,
  TURKLER: 80,
  TEKIROVA: 80,
  KONAKLI: 85,
  ALANYA_MERKEZ: 100,
  MAHMUTLAR: 100,
};

const SPRINTER_ZONE_ONE_WAY_EUR: Record<string, number> = {
  KUNDU_LARA: 50,
  KALE_ICI: 50,
  KONYAALTI: 50,
  KADRIYE_BELEK: 70,
  BOGAZKENT: 75,
  COLAKLI_SIDE: 75,
  SORGUN: 90,
  BELDIBI_GOYNUK: 80,
  KEMER: 90,
  KIZILAGAC_KIZILOT: 100,
  CAMYUVA_KIRIS: 90,
  OKURCALAR_AVSALLAR: 100,
  TURKLER: 100,
  TEKIROVA: 110,
  KONAKLI: 115,
  ALANYA_MERKEZ: 140,
  MAHMUTLAR: 140,
};

function withOneWayPremium(
  zonePrices: Record<string, number>,
): Record<string, number> {
  return Object.fromEntries(
    Object.entries(zonePrices).map(([zone, oneWayEur]) => [
      zone,
      oneWayEur + SALES_TIER_PREMIUM_EUR,
    ]),
  );
}

/** vehicle code → transfer zone one-way EUR prices */
const VEHICLE_SALES_PRICES: Record<string, Record<string, number>> = {
  ULTRA_VIP_VITO: VITO_ZONE_ONE_WAY_EUR,
  ULTRA_MAYBACK_VIP_VITO: withOneWayPremium(VITO_ZONE_ONE_WAY_EUR),
  SPRINTER_ULTRA: SPRINTER_ZONE_ONE_WAY_EUR,
  PREMIUM_VIP_SPRINTER: withOneWayPremium(SPRINTER_ZONE_ONE_WAY_EUR),
};

function toMinor(eurMajor: number): number {
  return Math.round(eurMajor * 100);
}

async function main(): Promise<void> {
  const vehicleFilter = process.argv.slice(2);
  const vehicleCodes =
    vehicleFilter.length > 0
      ? vehicleFilter
      : Object.keys(VEHICLE_SALES_PRICES);

  const pool = new Pool({
    connectionString:
      process.env.DATABASE_URL ??
      "postgresql://placeholder:placeholder@localhost/placeholder?sslmode=require",
  });
  const db = drizzle(pool, { schema });

  const vehicles = await db
    .select({
      id: schema.vehicleCategories.id,
      code: schema.vehicleCategories.code,
    })
    .from(schema.vehicleCategories)
    .where(
      and(
        inArray(schema.vehicleCategories.code, vehicleCodes),
        isNull(schema.vehicleCategories.deletedAt),
      ),
    );

  if (vehicles.length !== vehicleCodes.length) {
    const found = new Set(vehicles.map((vehicle) => vehicle.code));
    const missing = vehicleCodes.filter((code) => !found.has(code));
    throw new Error(`Missing vehicles: ${missing.join(", ")}`);
  }

  const [airport] = await db
    .select({ id: schema.locations.id })
    .from(schema.locations)
    .where(eq(schema.locations.code, AIRPORT_CODE))
    .limit(1);

  if (!airport) {
    throw new Error(`Airport not found: ${AIRPORT_CODE}`);
  }

  const districts = await db
    .select({
      id: schema.locations.id,
      code: schema.locations.code,
    })
    .from(schema.locations)
    .where(
      and(
        eq(schema.locations.type, "DISTRICT"),
        eq(schema.locations.isActive, true),
        isNull(schema.locations.deletedAt),
      ),
    );

  for (const vehicle of vehicles) {
    const zonePrices = VEHICLE_SALES_PRICES[vehicle.code];
    if (!zonePrices) {
      throw new Error(`No sales prices configured for ${vehicle.code}`);
    }

    console.log(`\n=== ${vehicle.code} ===`);

    for (const district of districts) {
      const [existingRoute] = await db
        .select({ id: schema.routes.id })
        .from(schema.routes)
        .where(
          and(
            eq(schema.routes.originLocationId, airport.id),
            eq(schema.routes.destinationLocationId, district.id),
          ),
        )
        .limit(1);

      let routeId = existingRoute?.id;
      if (!routeId) {
        const [created] = await db
          .insert(schema.routes)
          .values({
            originLocationId: airport.id,
            destinationLocationId: district.id,
          })
          .returning({ id: schema.routes.id });
        routeId = created.id;
      }

      const [existingPrice] = await db
        .select({ id: schema.routePrices.id })
        .from(schema.routePrices)
        .where(
          and(
            eq(schema.routePrices.routeId, routeId),
            eq(schema.routePrices.vehicleCategoryId, vehicle.id),
            eq(schema.routePrices.currency, CURRENCY),
          ),
        )
        .limit(1);

      const oneWayEur = zonePrices[district.code];

      if (oneWayEur === undefined) {
        if (existingPrice) {
          await db
            .update(schema.routePrices)
            .set({
              isActive: false,
              deletedAt: new Date(),
            })
            .where(eq(schema.routePrices.id, existingPrice.id));
          console.log(`${district.code.padEnd(22)} cleared (null)`);
        } else {
          console.log(`${district.code.padEnd(22)} — (no price)`);
        }
        continue;
      }

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
          vehicleCategoryId: vehicle.id,
          oneWayPriceMinor: oneWayMinor,
          roundTripPriceMinor: roundTripMinor,
          currency: CURRENCY,
        });
      }

      console.log(
        `${district.code.padEnd(22)} €${oneWayEur} / €${oneWayEur * 2}`,
      );
    }
  }

  console.log("\nDone.");
  await pool.end();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
