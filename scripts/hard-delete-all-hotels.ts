import { Pool } from "@neondatabase/serverless";
import { eq, inArray, isNotNull } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-serverless";

import * as schema from "../src/db/schema";

async function main(): Promise<void> {
  const pool = new Pool({
    connectionString:
      process.env.DATABASE_URL ??
      "postgresql://placeholder:placeholder@localhost/placeholder?sslmode=require",
  });
  const db = drizzle(pool, { schema });

  await db.transaction(async (tx) => {
    const hotels = await tx
      .select({
        id: schema.locations.id,
        code: schema.locations.code,
      })
      .from(schema.locations)
      .where(eq(schema.locations.type, "HOTEL"));

    if (hotels.length === 0) {
      console.log("No hotels found.");
      return;
    }

    const hotelIds = hotels.map((hotel) => hotel.id);
    console.log(`Found ${hotelIds.length} hotels.`);

    const reservationsWithHotel = await tx
      .select({
        id: schema.reservations.id,
        reference: schema.reservations.reference,
      })
      .from(schema.reservations)
      .where(isNotNull(schema.reservations.hotelLocationId));

    if (reservationsWithHotel.length > 0) {
      await tx
        .update(schema.reservations)
        .set({ hotelLocationId: null })
        .where(isNotNull(schema.reservations.hotelLocationId));
      console.log(
        `Cleared hotel reference on ${reservationsWithHotel.length} reservations.`,
      );
    }

    await tx
      .delete(schema.locationFeaturedPrices)
      .where(inArray(schema.locationFeaturedPrices.locationId, hotelIds));

    await tx
      .delete(schema.locationTranslations)
      .where(inArray(schema.locationTranslations.locationId, hotelIds));

    await tx
      .delete(schema.locations)
      .where(eq(schema.locations.type, "HOTEL"));

    console.log(`Hard-deleted ${hotelIds.length} hotels and their translations.`);
  });

  const remaining = await db
    .select({ id: schema.locations.id })
    .from(schema.locations)
    .where(eq(schema.locations.type, "HOTEL"));

  console.log(
    remaining.length === 0
      ? "\nDone. No hotels remain."
      : `\nWarning: ${remaining.length} hotels still present.`,
  );

  await pool.end();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
