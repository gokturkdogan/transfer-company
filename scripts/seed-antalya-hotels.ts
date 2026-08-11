import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import { and, eq, isNull } from "drizzle-orm";

import * as schema from "../src/db/schema";
import { TRANSFER_ZONE_HOTELS } from "./data/transfer-zone-hotels";
import { buildHotelCode, slugifyHotelName } from "./lib/hotel-seed-utils";

const LOCALES = ["tr", "en", "de", "ru", "ar"] as const;

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ??
    "postgresql://placeholder:placeholder@localhost/placeholder?sslmode=require",
});
const db = drizzle(pool, { schema });

async function seedAntalyaHotels() {
  const [region] = await db
    .select()
    .from(schema.regions)
    .where(eq(schema.regions.code, "ANTALYA"))
    .limit(1);

  if (!region) {
    throw new Error("ANTALYA region not found. Run db:seed first.");
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
        isNull(schema.locations.deletedAt),
      ),
    );

  const districtByCode = new Map(
    districts.map((district) => [district.code, district.id]),
  );

  let created = 0;
  let skippedDistricts = 0;

  for (const [zoneCode, hotelNames] of Object.entries(TRANSFER_ZONE_HOTELS)) {
    const parentId = districtByCode.get(zoneCode);

    if (!parentId) {
      console.warn(`Transfer zone not found, skipping hotels: ${zoneCode}`);
      skippedDistricts += 1;
      continue;
    }

    for (const [index, name] of hotelNames.entries()) {
      const slug = slugifyHotelName(name);
      const code = buildHotelCode(zoneCode, name);

      const [inserted] = await db
        .insert(schema.locations)
        .values({
          regionId: region.id,
          parentId,
          code,
          type: "HOTEL",
          defaultName: name,
          sortOrder: index,
          isActive: true,
        })
        .onConflictDoNothing()
        .returning({ id: schema.locations.id });

      const locationId =
        inserted?.id ??
        (
          await db
            .select({ id: schema.locations.id })
            .from(schema.locations)
            .where(eq(schema.locations.code, code))
            .limit(1)
        )[0]?.id;

      if (!locationId) {
        throw new Error(`Failed to seed hotel ${code}`);
      }

      if (inserted) {
        created += 1;
      }

      for (const locale of LOCALES) {
        await db
          .insert(schema.locationTranslations)
          .values({
            locationId,
            locale,
            name,
            slug,
          })
          .onConflictDoNothing();
      }
    }

    console.log(`${zoneCode}: ${hotelNames.length} hotels`);
  }

  const totalHotels = Object.values(TRANSFER_ZONE_HOTELS).reduce(
    (sum, hotels) => sum + hotels.length,
    0,
  );

  console.log(
    `\nTransfer zone hotels ready: ${totalHotels} defined, ${created} newly inserted, ${skippedDistricts} zones skipped.`,
  );

  await pool.end();
}

seedAntalyaHotels().catch((error) => {
  console.error(error);
  process.exit(1);
});
