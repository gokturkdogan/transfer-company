import { Pool } from "@neondatabase/serverless";
import { and, eq, isNull } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-serverless";

import * as schema from "../src/db/schema";

const VEHICLE_CODE = "VITO_WHITE";
const AIRPORT_CODE = "AYT";

function randomOneWayMinor(): number {
  const steps = Math.floor(Math.random() * 15) + 9;
  return steps * 500;
}

function randomRoundTripMinor(oneWay: number): number {
  const multiplier = 1.75 + Math.random() * 0.2;
  return Math.round((oneWay * multiplier) / 100) * 100;
}

async function main(): Promise<void> {
  const pool = new Pool({
    connectionString:
      process.env.DATABASE_URL ??
      "postgresql://placeholder:placeholder@localhost/placeholder?sslmode=require",
  });
  const db = drizzle(pool, { schema });

  const [vehicle] = await db
    .select({
      id: schema.vehicleCategories.id,
      code: schema.vehicleCategories.code,
    })
    .from(schema.vehicleCategories)
    .where(
      and(
        eq(schema.vehicleCategories.code, VEHICLE_CODE),
        isNull(schema.vehicleCategories.deletedAt),
      ),
    )
    .limit(1);

  if (!vehicle) {
    throw new Error(`Vehicle not found: ${VEHICLE_CODE}`);
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

  let inserted = 0;
  let updated = 0;

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

    const oneWay = randomOneWayMinor();
    const roundTrip = randomRoundTripMinor(oneWay);

    const [existingPrice] = await db
      .select({ id: schema.routePrices.id })
      .from(schema.routePrices)
      .where(
        and(
          eq(schema.routePrices.routeId, routeId),
          eq(schema.routePrices.vehicleCategoryId, vehicle.id),
          eq(schema.routePrices.currency, "EUR"),
        ),
      )
      .limit(1);

    if (existingPrice) {
      await db
        .update(schema.routePrices)
        .set({
          oneWayPriceMinor: oneWay,
          roundTripPriceMinor: roundTrip,
          isActive: true,
          deletedAt: null,
        })
        .where(eq(schema.routePrices.id, existingPrice.id));
      updated += 1;
    } else {
      await db.insert(schema.routePrices).values({
        routeId,
        vehicleCategoryId: vehicle.id,
        oneWayPriceMinor: oneWay,
        roundTripPriceMinor: roundTrip,
        currency: "EUR",
      });
      inserted += 1;
    }

    console.log(
      `${district.code.padEnd(14)} €${(oneWay / 100).toFixed(0)} / €${(roundTrip / 100).toFixed(0)}`,
    );
  }

  console.log(
    `\nDone: ${inserted} inserted, ${updated} updated for ${vehicle.code}`,
  );
  await pool.end();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
