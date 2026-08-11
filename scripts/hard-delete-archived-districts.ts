import { Pool } from "@neondatabase/serverless";
import { inArray, like, or, sql } from "drizzle-orm";
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
    const archivedDistricts = await tx
      .select({ id: schema.locations.id, code: schema.locations.code })
      .from(schema.locations)
      .where(like(schema.locations.code, "ARCHIVED_%"));

    if (archivedDistricts.length === 0) {
      console.log("No archived districts found.");
      return;
    }

    const archivedIds = archivedDistricts.map((district) => district.id);
    console.log(`Found ${archivedIds.length} archived districts.`);

    const childLocations = await tx
      .select({ id: schema.locations.id, code: schema.locations.code })
      .from(schema.locations)
      .where(inArray(schema.locations.parentId, archivedIds));

    const childIds = childLocations.map((location) => location.id);
    const allLocationIds = [...archivedIds, ...childIds];

    if (childIds.length > 0) {
      console.log(`Found ${childIds.length} child locations under archived districts.`);
    }

    const relatedRoutes = await tx
      .select({ id: schema.routes.id })
      .from(schema.routes)
      .where(
        or(
          inArray(schema.routes.destinationLocationId, allLocationIds),
          inArray(schema.routes.originLocationId, allLocationIds),
        ),
      );

    const routeIds = relatedRoutes.map((route) => route.id);

    const relatedReservations = await tx
      .select({ id: schema.reservations.id, reference: schema.reservations.reference })
      .from(schema.reservations)
      .where(
        or(
          inArray(schema.reservations.dropoffLocationId, allLocationIds),
          inArray(schema.reservations.pickupLocationId, allLocationIds),
          inArray(schema.reservations.hotelLocationId, allLocationIds),
          routeIds.length > 0
            ? inArray(schema.reservations.routeId, routeIds)
            : sql`false`,
        ),
      );

    if (relatedReservations.length > 0) {
      const reservationIds = relatedReservations.map(
        (reservation) => reservation.id,
      );
      await tx
        .delete(schema.reservationItems)
        .where(inArray(schema.reservationItems.reservationId, reservationIds));
      await tx
        .delete(schema.reservations)
        .where(inArray(schema.reservations.id, reservationIds));
      console.log(
        `Deleted ${relatedReservations.length} reservations:`,
        relatedReservations.map((reservation) => reservation.reference).join(", "),
      );
    }

    if (routeIds.length > 0) {
      await tx
        .delete(schema.routePrices)
        .where(inArray(schema.routePrices.routeId, routeIds));
      await tx.delete(schema.routes).where(inArray(schema.routes.id, routeIds));
      console.log(`Deleted ${routeIds.length} routes and their prices.`);
    }

    if (allLocationIds.length > 0) {
      await tx
        .delete(schema.locationFeaturedPrices)
        .where(inArray(schema.locationFeaturedPrices.locationId, allLocationIds));
      await tx
        .delete(schema.locationTranslations)
        .where(inArray(schema.locationTranslations.locationId, allLocationIds));
      await tx
        .delete(schema.locations)
        .where(inArray(schema.locations.id, allLocationIds));
      console.log(`Hard-deleted ${allLocationIds.length} locations.`);
    }

    console.log(
      "Removed districts:",
      archivedDistricts.map((district) => district.code).join(", "),
    );
  });

  const remaining = await db
    .select({ code: schema.locations.code })
    .from(schema.locations)
    .where(like(schema.locations.code, "ARCHIVED_%"));

  console.log(
    remaining.length === 0
      ? "\nDone. No archived districts remain."
      : `\nWarning: ${remaining.length} archived rows still present.`,
  );

  await pool.end();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
