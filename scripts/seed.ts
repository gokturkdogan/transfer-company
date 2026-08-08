import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import { and, eq } from "drizzle-orm";

import * as schema from "../src/db/schema";

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ??
    "postgresql://placeholder:placeholder@localhost/placeholder?sslmode=require",
});
const db = drizzle(pool, { schema });

type LocationType = "AIRPORT" | "CITY" | "DISTRICT" | "HOTEL";

type LocationTranslationSeed = {
  name: string;
  slug: string;
};

type LocationSeed = {
  code: string;
  type: LocationType;
  defaultName: string;
  sortOrder: number;
  parentCode?: string;
  translations: Record<string, LocationTranslationSeed>;
};

type DistrictPriceSeed = {
  districtCode: string;
  vitoOneWay: number;
  vitoRoundTrip: number;
};

async function upsertRegion(code: string): Promise<string> {
  const [region] = await db
    .insert(schema.regions)
    .values({ code })
    .onConflictDoNothing()
    .returning();

  const regionRow =
    region ??
    (
      await db
        .select()
        .from(schema.regions)
        .where(eq(schema.regions.code, code))
        .limit(1)
    )[0];

  if (!regionRow) {
    throw new Error(`Failed to seed region ${code}`);
  }

  return regionRow.id;
}

async function upsertLocation(
  regionId: string,
  locationSeed: LocationSeed,
  parentId: string | null,
  locationIds: Record<string, string>,
): Promise<string> {
  const [location] = await db
    .insert(schema.locations)
    .values({
      regionId,
      parentId,
      code: locationSeed.code,
      type: locationSeed.type,
      defaultName: locationSeed.defaultName,
      sortOrder: locationSeed.sortOrder,
    })
    .onConflictDoNothing()
    .returning();

  const locationRow =
    location ??
    (
      await db
        .select()
        .from(schema.locations)
        .where(eq(schema.locations.code, locationSeed.code))
        .limit(1)
    )[0];

  if (!locationRow) {
    throw new Error(`Failed to seed location ${locationSeed.code}`);
  }

  locationIds[locationSeed.code] = locationRow.id;

  for (const [locale, translation] of Object.entries(locationSeed.translations)) {
    await db
      .insert(schema.locationTranslations)
      .values({
        locationId: locationRow.id,
        locale,
        name: translation.name,
        slug: translation.slug,
      })
      .onConflictDoNothing();
  }

  return locationRow.id;
}

async function upsertVehicle(
  vehicleSeed: {
    code: string;
    defaultName: string;
    passengerCapacity: number;
    largeLuggageCapacity: number;
    cabinLuggageCapacity: number;
    sortOrder: number;
    translations: Record<string, { name: string; shortDescription: string }>;
  },
  vehicleIds: Record<string, string>,
): Promise<string> {
  const [vehicle] = await db
    .insert(schema.vehicleCategories)
    .values({
      code: vehicleSeed.code,
      defaultName: vehicleSeed.defaultName,
      passengerCapacity: vehicleSeed.passengerCapacity,
      largeLuggageCapacity: vehicleSeed.largeLuggageCapacity,
      cabinLuggageCapacity: vehicleSeed.cabinLuggageCapacity,
      sortOrder: vehicleSeed.sortOrder,
    })
    .onConflictDoNothing()
    .returning();

  const vehicleRow =
    vehicle ??
    (
      await db
        .select()
        .from(schema.vehicleCategories)
        .where(eq(schema.vehicleCategories.code, vehicleSeed.code))
        .limit(1)
    )[0];

  if (!vehicleRow) {
    throw new Error(`Failed to seed vehicle ${vehicleSeed.code}`);
  }

  vehicleIds[vehicleSeed.code] = vehicleRow.id;

  for (const [locale, translation] of Object.entries(vehicleSeed.translations)) {
    await db
      .insert(schema.vehicleCategoryTranslations)
      .values({
        vehicleCategoryId: vehicleRow.id,
        locale,
        name: translation.name,
        shortDescription: translation.shortDescription,
      })
      .onConflictDoNothing();
  }

  return vehicleRow.id;
}

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

function scaleSprinterPrices(vitoOneWay: number, vitoRoundTrip: number) {
  return {
    oneWay: Math.round(vitoOneWay * 1.67),
    roundTrip: Math.round(vitoRoundTrip * 1.65),
  };
}

function scaleSedanPrices(vitoOneWay: number, vitoRoundTrip: number) {
  return {
    oneWay: Math.round(vitoOneWay * 0.78),
    roundTrip: Math.round(vitoRoundTrip * 0.76),
  };
}

async function seed() {
  const regionId = await upsertRegion("ANTALYA");
  const locationIds: Record<string, string> = {};

  const citySeed: LocationSeed = {
    code: "ANTALYA",
    type: "CITY",
    defaultName: "Antalya",
    sortOrder: 0,
    translations: {
      tr: { name: "Antalya", slug: "antalya" },
      en: { name: "Antalya", slug: "antalya" },
    },
  };

  await upsertLocation(regionId, citySeed, null, locationIds);
  const cityId = locationIds.ANTALYA!;

  const airportSeed: LocationSeed = {
    code: "AYT",
    type: "AIRPORT",
    defaultName: "Antalya Airport",
    sortOrder: 1,
    parentCode: "ANTALYA",
    translations: {
      tr: { name: "Antalya Havalimanı", slug: "antalya-havalimani" },
      en: { name: "Antalya Airport", slug: "antalya-airport" },
    },
  };

  await upsertLocation(regionId, airportSeed, cityId, locationIds);

  const districtSeeds: LocationSeed[] = [
    {
      code: "BELEK",
      type: "DISTRICT",
      defaultName: "Belek",
      sortOrder: 2,
      parentCode: "ANTALYA",
      translations: {
        tr: { name: "Belek", slug: "belek" },
        en: { name: "Belek", slug: "belek" },
      },
    },
    {
      code: "KEMER",
      type: "DISTRICT",
      defaultName: "Kemer",
      sortOrder: 3,
      parentCode: "ANTALYA",
      translations: {
        tr: { name: "Kemer", slug: "kemer" },
        en: { name: "Kemer", slug: "kemer" },
      },
    },
    {
      code: "SIDE",
      type: "DISTRICT",
      defaultName: "Side",
      sortOrder: 4,
      parentCode: "ANTALYA",
      translations: {
        tr: { name: "Side", slug: "side" },
        en: { name: "Side", slug: "side" },
      },
    },
    {
      code: "ALANYA",
      type: "DISTRICT",
      defaultName: "Alanya",
      sortOrder: 5,
      parentCode: "ANTALYA",
      translations: {
        tr: { name: "Alanya", slug: "alanya" },
        en: { name: "Alanya", slug: "alanya" },
      },
    },
  ];

  for (const districtSeed of districtSeeds) {
    await upsertLocation(regionId, districtSeed, cityId, locationIds);
  }

  const belekHotelSeeds: LocationSeed[] = [
    {
      code: "MAXX_ROYAL_BELEK",
      type: "HOTEL",
      defaultName: "Maxx Royal Belek",
      sortOrder: 0,
      parentCode: "BELEK",
      translations: {
        tr: { name: "Maxx Royal Belek", slug: "maxx-royal-belek" },
        en: { name: "Maxx Royal Belek", slug: "maxx-royal-belek" },
      },
    },
    {
      code: "REGNUM_CARYA",
      type: "HOTEL",
      defaultName: "Regnum Carya",
      sortOrder: 1,
      parentCode: "BELEK",
      translations: {
        tr: { name: "Regnum Carya", slug: "regnum-carya" },
        en: { name: "Regnum Carya", slug: "regnum-carya" },
      },
    },
    {
      code: "RIXOS_PREMIUM_BELEK",
      type: "HOTEL",
      defaultName: "Rixos Premium Belek",
      sortOrder: 2,
      parentCode: "BELEK",
      translations: {
        tr: { name: "Rixos Premium Belek", slug: "rixos-premium-belek" },
        en: { name: "Rixos Premium Belek", slug: "rixos-premium-belek" },
      },
    },
    {
      code: "SELECTUM_LUXURY",
      type: "HOTEL",
      defaultName: "Selectum Luxury",
      sortOrder: 3,
      parentCode: "BELEK",
      translations: {
        tr: { name: "Selectum Luxury", slug: "selectum-luxury" },
        en: { name: "Selectum Luxury", slug: "selectum-luxury" },
      },
    },
  ];

  for (const hotelSeed of belekHotelSeeds) {
    const parentId = locationIds[hotelSeed.parentCode!]!;
    await upsertLocation(regionId, hotelSeed, parentId, locationIds);
  }

  const alanyaHotelSeeds: LocationSeed[] = [
    {
      code: "RIXOS_PREMIUM_ALANYA",
      type: "HOTEL",
      defaultName: "Rixos Premium Alanya",
      sortOrder: 0,
      parentCode: "ALANYA",
      translations: {
        tr: { name: "Rixos Premium Alanya", slug: "rixos-premium-alanya" },
        en: { name: "Rixos Premium Alanya", slug: "rixos-premium-alanya" },
      },
    },
    {
      code: "LONG_BEACH_ALANYA",
      type: "HOTEL",
      defaultName: "Long Beach Resort Alanya",
      sortOrder: 1,
      parentCode: "ALANYA",
      translations: {
        tr: { name: "Long Beach Resort Alanya", slug: "long-beach-resort-alanya" },
        en: { name: "Long Beach Resort Alanya", slug: "long-beach-resort-alanya" },
      },
    },
  ];

  for (const hotelSeed of alanyaHotelSeeds) {
    const parentId = locationIds[hotelSeed.parentCode!]!;
    await upsertLocation(regionId, hotelSeed, parentId, locationIds);
  }

  const vehicleSeeds = [
    {
      code: "VITO",
      defaultName: "Mercedes Vito",
      passengerCapacity: 6,
      largeLuggageCapacity: 6,
      cabinLuggageCapacity: 2,
      sortOrder: 0,
      translations: {
        tr: { name: "Mercedes Vito", shortDescription: "Konforlu VIP transfer" },
        en: { name: "Mercedes Vito", shortDescription: "Comfortable VIP transfer" },
      },
    },
    {
      code: "SPRINTER",
      defaultName: "Mercedes Sprinter",
      passengerCapacity: 14,
      largeLuggageCapacity: 14,
      cabinLuggageCapacity: 4,
      sortOrder: 1,
      translations: {
        tr: { name: "Mercedes Sprinter", shortDescription: "Geniş grup transferi" },
        en: { name: "Mercedes Sprinter", shortDescription: "Spacious group transfer" },
      },
    },
    {
      code: "SEDAN",
      defaultName: "Premium Sedan",
      passengerCapacity: 3,
      largeLuggageCapacity: 3,
      cabinLuggageCapacity: 1,
      sortOrder: 2,
      translations: {
        tr: { name: "Premium Sedan", shortDescription: "Şık şehir transferi" },
        en: { name: "Premium Sedan", shortDescription: "Elegant city transfer" },
      },
    },
  ];

  const vehicleIds: Record<string, string> = {};

  for (const vehicleSeed of vehicleSeeds) {
    await upsertVehicle(vehicleSeed, vehicleIds);
  }

  const districtPriceSeeds: DistrictPriceSeed[] = [
    { districtCode: "BELEK", vitoOneWay: 4500, vitoRoundTrip: 8500 },
    { districtCode: "KEMER", vitoOneWay: 5000, vitoRoundTrip: 9500 },
    { districtCode: "SIDE", vitoOneWay: 5500, vitoRoundTrip: 10000 },
    { districtCode: "ALANYA", vitoOneWay: 8000, vitoRoundTrip: 15000 },
  ];

  const airportId = locationIds.AYT!;

  for (const priceSeed of districtPriceSeeds) {
    const districtId = locationIds[priceSeed.districtCode]!;
    const routeId = await upsertRoute(airportId, districtId);

    const sprinterPrices = scaleSprinterPrices(
      priceSeed.vitoOneWay,
      priceSeed.vitoRoundTrip,
    );
    const sedanPrices = scaleSedanPrices(
      priceSeed.vitoOneWay,
      priceSeed.vitoRoundTrip,
    );

    const routePriceSeeds = [
      {
        vehicleCode: "VITO",
        oneWay: priceSeed.vitoOneWay,
        roundTrip: priceSeed.vitoRoundTrip,
      },
      {
        vehicleCode: "SPRINTER",
        oneWay: sprinterPrices.oneWay,
        roundTrip: sprinterPrices.roundTrip,
      },
      {
        vehicleCode: "SEDAN",
        oneWay: sedanPrices.oneWay,
        roundTrip: sedanPrices.roundTrip,
      },
    ];

    for (const routePriceSeed of routePriceSeeds) {
      await db
        .insert(schema.routePrices)
        .values({
          routeId,
          vehicleCategoryId: vehicleIds[routePriceSeed.vehicleCode]!,
          oneWayPriceMinor: routePriceSeed.oneWay,
          roundTripPriceMinor: routePriceSeed.roundTrip,
          currency: "EUR",
        })
        .onConflictDoNothing();
    }
  }

  const extraSeeds = [
    {
      code: "LUGGAGE_VAN",
      pricingMode: "PER_UNIT" as const,
      priceMinor: 2500,
      customerSelectable: false,
      autoSuggested: true,
      luggageCapacityPerUnit: 10,
      maxQuantity: 5,
      sortOrder: 0,
      translations: {
        tr: { name: "Bagaj Aracı" },
        en: { name: "Luggage Vehicle" },
      },
    },
    {
      code: "CHILD_SEAT",
      pricingMode: "PER_UNIT" as const,
      priceMinor: 500,
      customerSelectable: true,
      autoSuggested: false,
      maxQuantity: 3,
      sortOrder: 1,
      translations: {
        tr: { name: "Çocuk Koltuğu" },
        en: { name: "Child Seat" },
      },
    },
    {
      code: "MEET_GREET",
      pricingMode: "FIXED" as const,
      priceMinor: 1500,
      customerSelectable: true,
      autoSuggested: false,
      maxQuantity: 1,
      sortOrder: 2,
      translations: {
        tr: { name: "VIP Karşılama" },
        en: { name: "VIP Meet & Greet" },
      },
    },
  ];

  for (const extraSeed of extraSeeds) {
    const [extra] = await db
      .insert(schema.extraServices)
      .values({
        code: extraSeed.code,
        pricingMode: extraSeed.pricingMode,
        priceMinor: extraSeed.priceMinor,
        currency: "EUR",
        customerSelectable: extraSeed.customerSelectable,
        autoSuggested: extraSeed.autoSuggested,
        luggageCapacityPerUnit: extraSeed.luggageCapacityPerUnit ?? null,
        maxQuantity: extraSeed.maxQuantity,
        sortOrder: extraSeed.sortOrder,
      })
      .onConflictDoNothing()
      .returning();

    const extraRow =
      extra ??
      (
        await db
          .select()
          .from(schema.extraServices)
          .where(eq(schema.extraServices.code, extraSeed.code))
          .limit(1)
      )[0];

    if (!extraRow) {
      throw new Error(`Failed to seed extra ${extraSeed.code}`);
    }

    for (const [locale, translation] of Object.entries(extraSeed.translations)) {
      await db
        .insert(schema.extraServiceTranslations)
        .values({
          extraServiceId: extraRow.id,
          locale,
          name: translation.name,
        })
        .onConflictDoNothing();
    }
  }

  for (const [index, currencySeed] of [
    { code: "EUR", label: "Euro (EUR)" },
    { code: "TRY", label: "Türk Lirası (TRY)" },
  ].entries()) {
    await db
      .insert(schema.enabledCurrencies)
      .values({
        code: currencySeed.code,
        label: currencySeed.label,
        sortOrder: index,
      })
      .onConflictDoNothing();
  }

  console.log("Seed completed successfully");
  await pool.end();
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
