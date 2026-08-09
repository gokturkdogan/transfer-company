import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import { and, eq } from "drizzle-orm";

import * as schema from "../src/db/schema";
import { ANTALYA_OFFICIAL_DISTRICTS } from "./data/antalya-districts";

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ??
    "postgresql://placeholder:placeholder@localhost/placeholder?sslmode=require",
});
const db = drizzle(pool, { schema });

const LOCALES = ["tr", "en", "de", "ru", "ar"] as const;

async function upsertRoute(
  originLocationId: string,
  destinationLocationId: string,
): Promise<string> {
  const [route] = await db
    .insert(schema.routes)
    .values({
      originLocationId,
      destinationLocationId,
    })
    .onConflictDoNothing()
    .returning();

  const routeRow =
    route ??
    (
      await db
        .select()
        .from(schema.routes)
        .where(
          and(
            eq(schema.routes.originLocationId, originLocationId),
            eq(schema.routes.destinationLocationId, destinationLocationId),
          ),
        )
        .limit(1)
    )[0];

  if (!routeRow) {
    throw new Error("Failed to seed route");
  }

  return routeRow.id;
}

async function seedAntalyaDistricts() {
  const [region] = await db
    .select()
    .from(schema.regions)
    .where(eq(schema.regions.code, "ANTALYA"))
    .limit(1);

  if (!region) {
    throw new Error("ANTALYA region not found. Run db:seed first.");
  }

  const [city] = await db
    .select()
    .from(schema.locations)
    .where(eq(schema.locations.code, "ANTALYA"))
    .limit(1);

  if (!city) {
    throw new Error("ANTALYA city not found. Run db:seed first.");
  }

  const [airport] = await db
    .select()
    .from(schema.locations)
    .where(eq(schema.locations.code, "AYT"))
    .limit(1);

  if (!airport) {
    throw new Error("AYT airport not found. Run db:seed first.");
  }

  let createdDistricts = 0;
  let createdRoutes = 0;

  for (const district of ANTALYA_OFFICIAL_DISTRICTS) {
    const [existing] = await db
      .select({ id: schema.locations.id })
      .from(schema.locations)
      .where(eq(schema.locations.code, district.code))
      .limit(1);

    let locationId = existing?.id;

    if (!locationId) {
      const [inserted] = await db
        .insert(schema.locations)
        .values({
          regionId: region.id,
          parentId: city.id,
          code: district.code,
          type: "DISTRICT",
          defaultName: district.defaultName,
          sortOrder: district.sortOrder,
          isActive: true,
        })
        .returning({ id: schema.locations.id });

      locationId = inserted?.id;
      createdDistricts += 1;
    }

    if (!locationId) {
      throw new Error(`Failed to upsert district ${district.code}`);
    }

    for (const locale of LOCALES) {
      await db
        .insert(schema.locationTranslations)
        .values({
          locationId,
          locale,
          name: district.names[locale],
          slug: district.slug,
        })
        .onConflictDoNothing();
    }

    const [existingRoute] = await db
      .select({ id: schema.routes.id })
      .from(schema.routes)
      .where(
        and(
          eq(schema.routes.originLocationId, airport.id),
          eq(schema.routes.destinationLocationId, locationId),
        ),
      )
      .limit(1);

    if (!existingRoute) {
      await upsertRoute(airport.id, locationId);
      createdRoutes += 1;
    }
  }

  console.log(
    `Antalya districts ready: ${ANTALYA_OFFICIAL_DISTRICTS.length} total, ${createdDistricts} new districts, ${createdRoutes} new AYT routes.`,
  );

  await pool.end();
}

seedAntalyaDistricts().catch((error) => {
  console.error(error);
  process.exit(1);
});
