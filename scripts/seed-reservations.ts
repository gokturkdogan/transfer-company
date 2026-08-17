import { Pool } from "@neondatabase/serverless";
import { and, eq, inArray, like } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-serverless";

import { DEFAULT_CURRENCY } from "../src/config/constants";
import * as schema from "../src/db/schema";
import type { ReservationStatus } from "../src/db/schema/enums";

/**
 * Demo rezervasyon seed — yalnızca INSERT.
 * Mevcut kayıtları silmez, güncellemez veya başka tablolara dokunmaz.
 * Aynı gün tekrar çalıştırıldığında aynı referanslar atlanır (idempotent).
 */
const DEMO_REFERENCE_PREFIX_BASE = "TR-SEED";

/** Önümüzdeki 2 hafta + geçmiş hafta (tamamlanan trend için). */
const PAST_OUTBOUND_DAYS = 7;
const FORWARD_OUTBOUND_DAYS = 14;
const MIN_RESERVATIONS_PER_DAY = 2;
const MAX_RESERVATIONS_PER_DAY = 10;
const TARGET_MIN_TOTAL = 90;

const DISTRICT_CODES = ["BELEK", "KEMER", "SIDE", "ALANYA"] as const;
const VEHICLE_CODES = ["VITO", "SPRINTER", "SEDAN"] as const;
const SNAPSHOT_LOCALES = ["tr", "en", "de", "ru", "ar"] as const;
const EXTRA_CODES = ["CHILD_SEAT", "MEET_GREET"] as const;

const FIRST_NAMES = [
  "Ayşe",
  "Mehmet",
  "Zeynep",
  "John",
  "Emma",
  "Oliver",
  "Sophie",
  "Hans",
  "Anna",
  "Ivan",
  "Elena",
  "Mohammed",
  "Fatima",
  "James",
  "Maria",
  "Lars",
  "Yuki",
  "Chen",
  "Piotr",
  "Sofia",
  "Nikolai",
  "Amira",
  "David",
  "Laura",
  "Thomas",
  "Olga",
  "Giuseppe",
  "Nina",
  "Andreas",
  "Klara",
] as const;

const LAST_NAMES = [
  "Yılmaz",
  "Demir",
  "Kaya",
  "Smith",
  "Wilson",
  "Müller",
  "Schmidt",
  "Petrov",
  "Volkov",
  "Al-Rashid",
  "García",
  "Rossi",
  "Jensen",
  "Nowak",
  "Brown",
  "Martin",
  "Andersson",
  "Dubois",
  "Kowalski",
  "Nagy",
  "Popescu",
  "Silva",
  "O'Brien",
  "Tanaka",
  "Wang",
  "Hassan",
  "Bergström",
  "Fischer",
  "Novak",
  "Horvat",
] as const;

const FLIGHT_PREFIXES = ["PC", "TK", "XQ", "BA", "FR", "EZY", "AF", "LH", "SK", "W6"] as const;

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ??
    "postgresql://placeholder:placeholder@localhost/placeholder?sslmode=require",
});
const db = drizzle(pool, { schema });

type RouteContext = {
  routeId: string;
  airportId: string;
  districtId: string;
  districtName: string;
  districtCode: string;
  vehicleCode: string;
  oneWayMinor: number;
  roundTripMinor: number;
};

type VehicleContext = {
  id: string;
  code: string;
  defaultName: string;
  namesByLocale: Map<string, string>;
};

type ExtraContext = {
  id: string;
  code: string;
  namesByLocale: Map<string, string>;
  priceMinor: number;
};

type GeneratedReservation = {
  referenceSuffix: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: ReservationStatus;
  tripType: "ONE_WAY" | "ROUND_TRIP";
  districtCode: string;
  vehicleCode: string;
  outboundAt: Date;
  returnAt: Date | null;
  createdAt: Date;
  passengerCount: number;
  largeLuggageCount: number;
  cabinLuggageCount: number;
  outboundFlightNumber?: string;
  returnFlightNumber?: string;
  notes?: string;
  extras: Array<{ code: string; quantity: number }>;
  snapshotLocale: string;
  includeLuggageOverflowVehicle: boolean;
  luggageVehicleCode: string;
};

function createRng(seed: number) {
  let state = seed;

  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

function pick<T>(rng: () => number, items: readonly T[]): T {
  return items[Math.floor(rng() * items.length)];
}

function pickInt(rng: () => number, min: number, max: number): number {
  return min + Math.floor(rng() * (max - min + 1));
}

function addDays(base: Date, days: number): Date {
  const result = new Date(base);
  result.setDate(result.getDate() + days);
  return result;
}

function withTime(base: Date, hour: number, minute: number): Date {
  const result = new Date(base);
  result.setHours(hour, minute, 0, 0);
  return result;
}

function buildDayCounts(
  rng: () => number,
  days: number,
  minPerDay: number,
  maxPerDay: number,
  targetMinTotal: number,
): number[] {
  const counts = Array.from({ length: days }, () =>
    pickInt(rng, minPerDay, maxPerDay),
  );

  let total = counts.reduce((sum, count) => sum + count, 0);

  while (total < targetMinTotal) {
    const index = Math.floor(rng() * days);
    if (counts[index] < maxPerDay) {
      counts[index] += 1;
      total += 1;
    }
  }

  return counts;
}

function formatBatchId(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}

function buildDemoReferencePrefix(batchId: string): string {
  return `${DEMO_REFERENCE_PREFIX_BASE}-${batchId}-`;
}

function buildEmail(batchId: string, index: number): string {
  return `seed.${batchId}.${String(index).padStart(4, "0")}@demo.transfer.local`;
}

function buildPhone(rng: () => number, index: number): string {
  const prefixes = ["+90555", "+90532", "+4479", "+4915", "+336", "+3903", "+346"];
  const prefix = prefixes[Math.floor(rng() * prefixes.length)];
  const suffix = String(1000000 + index * 137 + Math.floor(rng() * 9999)).slice(-7);
  return `${prefix}${suffix}`;
}

function buildFlightNumber(rng: () => number): string {
  return `${pick(rng, FLIGHT_PREFIXES)}${pickInt(rng, 100, 9999)}`;
}

function statusForOutbound(
  rng: () => number,
  outboundAt: Date,
  now: Date,
): ReservationStatus {
  if (outboundAt.getTime() < now.getTime() - 2 * 60 * 60 * 1000) {
    return rng() < 0.12 ? "CANCELLED" : "COMPLETED";
  }

  const roll = rng();
  if (roll < 0.22) return "PENDING";
  if (roll < 0.78) return "CONFIRMED";
  return "CANCELLED";
}

type RouteCombo = {
  districtCode: string;
  vehicleCode: string;
};

function buildGeneratedReservations(
  now: Date,
  routeCombos: RouteCombo[],
  batchId: string,
): GeneratedReservation[] {
  if (routeCombos.length === 0) {
    throw new Error("No route prices found. Run pnpm db:seed first.");
  }

  const rng = createRng(20260817);
  const totalDays = PAST_OUTBOUND_DAYS + FORWARD_OUTBOUND_DAYS;
  const forwardCounts = buildDayCounts(
    rng,
    FORWARD_OUTBOUND_DAYS,
    MIN_RESERVATIONS_PER_DAY,
    MAX_RESERVATIONS_PER_DAY,
    TARGET_MIN_TOTAL,
  );
  const pastCounts = Array.from({ length: PAST_OUTBOUND_DAYS }, () =>
    pickInt(rng, 3, 6),
  );

  const reservations: GeneratedReservation[] = [];
  let counter = 1;

  const sprinterDistricts = new Set(
    routeCombos
      .filter((combo) => combo.vehicleCode === "SPRINTER")
      .map((combo) => combo.districtCode),
  );

  for (let dayIndex = 0; dayIndex < totalDays; dayIndex += 1) {
    const dayOffset =
      dayIndex < PAST_OUTBOUND_DAYS
        ? -(PAST_OUTBOUND_DAYS - dayIndex)
        : dayIndex - PAST_OUTBOUND_DAYS + 1;

    const countForDay =
      dayIndex < PAST_OUTBOUND_DAYS
        ? pastCounts[dayIndex]
        : forwardCounts[dayIndex - PAST_OUTBOUND_DAYS];

    for (let slot = 0; slot < countForDay; slot += 1) {
      const firstName = pick(rng, FIRST_NAMES);
      const lastName = pick(rng, LAST_NAMES);
      const routeCombo = pick(rng, routeCombos);
      const districtCode = routeCombo.districtCode;
      const vehicleCode = routeCombo.vehicleCode;
      const tripType = rng() < 0.32 ? "ROUND_TRIP" : "ONE_WAY";
      const hour = pickInt(rng, 6, 22);
      const minute = pick(rng, [0, 5, 10, 15, 20, 30, 35, 45, 50]);
      const outboundAt = withTime(addDays(now, dayOffset), hour, minute);
      const returnGap = pickInt(rng, 4, 10);
      const returnAt =
        tripType === "ROUND_TRIP"
          ? withTime(addDays(outboundAt, returnGap), pickInt(rng, 8, 20), minute)
          : null;

      const daysBeforeOutbound = pickInt(
        rng,
        1,
        Math.max(2, Math.min(21, dayOffset > 0 ? dayOffset + 3 : 14)),
      );
      const createdAt = withTime(
        addDays(outboundAt, -daysBeforeOutbound),
        pickInt(rng, 9, 21),
        pickInt(rng, 0, 59),
      );

      const passengerCount = pickInt(rng, 1, 12);
      const largeLuggageCount = pickInt(rng, 0, Math.min(14, passengerCount + 4));
      const cabinLuggageCount = pickInt(rng, 0, Math.min(4, passengerCount));
      const includeLuggageOverflowVehicle =
        largeLuggageCount >= 7 &&
        rng() < 0.28 &&
        vehicleCode !== "SPRINTER" &&
        sprinterDistricts.has(districtCode);

      const extras: Array<{ code: string; quantity: number }> = [];
      if (rng() < 0.35) {
        extras.push({
          code: "CHILD_SEAT",
          quantity: pickInt(rng, 1, Math.min(3, passengerCount)),
        });
      }
      if (rng() < 0.18) {
        extras.push({ code: "MEET_GREET", quantity: 1 });
      }

      const hasFlight = rng() < 0.72;
      const outboundFlightNumber = hasFlight ? buildFlightNumber(rng) : undefined;
      const returnFlightNumber =
        tripType === "ROUND_TRIP" && hasFlight ? buildFlightNumber(rng) : undefined;

      const notes =
        rng() < 0.14
          ? pick(rng, [
              "Uçuş gecikmesi olabilir, lütfen takip edin.",
              "Otel lobisinde bekleyecekler.",
              "Bebek koltuğu ön koltuk tarafı tercih.",
              "WhatsApp ile iletişim tercih edilir.",
              "Müşteri uçuşunu iptal etti.",
              "Ödeme onayı beklemede.",
              "VIP karşılama istendi.",
            ])
          : undefined;

      reservations.push({
        referenceSuffix: String(counter).padStart(4, "0"),
        firstName,
        lastName,
        email: buildEmail(batchId, counter),
        phone: buildPhone(rng, counter),
        status: statusForOutbound(rng, outboundAt, now),
        tripType,
        districtCode,
        vehicleCode,
        outboundAt,
        returnAt,
        createdAt,
        passengerCount,
        largeLuggageCount,
        cabinLuggageCount,
        outboundFlightNumber,
        returnFlightNumber,
        notes,
        extras,
        snapshotLocale: pick(rng, SNAPSHOT_LOCALES),
        includeLuggageOverflowVehicle,
        luggageVehicleCode: "SPRINTER",
      });

      counter += 1;
    }
  }

  return reservations;
}

async function loadAirportId(): Promise<string> {
  const [airport] = await db
    .select({ id: schema.locations.id })
    .from(schema.locations)
    .where(eq(schema.locations.code, "AYT"))
    .limit(1);

  if (!airport) {
    throw new Error("Antalya Airport (AYT) not found. Run pnpm db:seed first.");
  }

  return airport.id;
}

async function loadRoutes(airportId: string): Promise<Map<string, RouteContext>> {
  const rows = await db
    .select({
      routeId: schema.routes.id,
      districtId: schema.locations.id,
      districtCode: schema.locations.code,
      districtName: schema.locations.defaultName,
      vehicleCode: schema.vehicleCategories.code,
      oneWayMinor: schema.routePrices.oneWayPriceMinor,
      roundTripMinor: schema.routePrices.roundTripPriceMinor,
    })
    .from(schema.routes)
    .innerJoin(
      schema.locations,
      eq(schema.routes.destinationLocationId, schema.locations.id),
    )
    .innerJoin(
      schema.routePrices,
      eq(schema.routePrices.routeId, schema.routes.id),
    )
    .innerJoin(
      schema.vehicleCategories,
      eq(schema.routePrices.vehicleCategoryId, schema.vehicleCategories.id),
    )
    .where(
      and(
        eq(schema.routes.originLocationId, airportId),
        inArray(schema.locations.code, [...DISTRICT_CODES]),
        inArray(schema.vehicleCategories.code, [...VEHICLE_CODES]),
        eq(schema.routePrices.currency, DEFAULT_CURRENCY),
      ),
    );

  const routeMap = new Map<string, RouteContext>();

  for (const row of rows) {
    routeMap.set(`${row.districtCode}:${row.vehicleCode}`, {
      routeId: row.routeId,
      airportId,
      districtId: row.districtId,
      districtName: row.districtName,
      districtCode: row.districtCode,
      vehicleCode: row.vehicleCode,
      oneWayMinor: row.oneWayMinor,
      roundTripMinor: row.roundTripMinor ?? row.oneWayMinor * 2,
    });
  }

  return routeMap;
}

async function loadVehicles(): Promise<Map<string, VehicleContext>> {
  const rows = await db
    .select({
      id: schema.vehicleCategories.id,
      code: schema.vehicleCategories.code,
      defaultName: schema.vehicleCategories.defaultName,
      locale: schema.vehicleCategoryTranslations.locale,
      translatedName: schema.vehicleCategoryTranslations.name,
    })
    .from(schema.vehicleCategories)
    .leftJoin(
      schema.vehicleCategoryTranslations,
      eq(
        schema.vehicleCategoryTranslations.vehicleCategoryId,
        schema.vehicleCategories.id,
      ),
    )
    .where(inArray(schema.vehicleCategories.code, [...VEHICLE_CODES]));

  const vehicleMap = new Map<string, VehicleContext>();

  for (const row of rows) {
    const existing = vehicleMap.get(row.code) ?? {
      id: row.id,
      code: row.code,
      defaultName: row.defaultName,
      namesByLocale: new Map<string, string>(),
    };

    if (row.locale && row.translatedName) {
      existing.namesByLocale.set(row.locale, row.translatedName);
    }

    vehicleMap.set(row.code, existing);
  }

  return vehicleMap;
}

async function loadExtras(): Promise<Map<string, ExtraContext>> {
  const rows = await db
    .select({
      id: schema.extraServices.id,
      code: schema.extraServices.code,
      locale: schema.extraServiceTranslations.locale,
      name: schema.extraServiceTranslations.name,
      priceMinor: schema.extraServicePrices.priceMinor,
    })
    .from(schema.extraServices)
    .leftJoin(
      schema.extraServiceTranslations,
      eq(schema.extraServiceTranslations.extraServiceId, schema.extraServices.id),
    )
    .leftJoin(
      schema.extraServicePrices,
      and(
        eq(schema.extraServicePrices.extraServiceId, schema.extraServices.id),
        eq(schema.extraServicePrices.currency, DEFAULT_CURRENCY),
      ),
    )
    .where(inArray(schema.extraServices.code, [...EXTRA_CODES]));

  const extraMap = new Map<string, ExtraContext>();

  for (const row of rows) {
    const existing = extraMap.get(row.code) ?? {
      id: row.id,
      code: row.code,
      namesByLocale: new Map<string, string>(),
      priceMinor: row.priceMinor ?? 0,
    };

    if (row.priceMinor !== null && row.priceMinor !== undefined) {
      existing.priceMinor = row.priceMinor;
    }

    if (row.locale && row.name) {
      existing.namesByLocale.set(row.locale, row.name);
    }

    extraMap.set(row.code, existing);
  }

  return extraMap;
}

function resolveLocalizedName(
  namesByLocale: Map<string, string>,
  defaultName: string,
  locale: string,
): string {
  return (
    namesByLocale.get(locale) ??
    namesByLocale.get("en") ??
    namesByLocale.get("tr") ??
    defaultName
  );
}

async function loadExistingDemoReferences(
  referencePrefix: string,
): Promise<Set<string>> {
  const rows = await db
    .select({ reference: schema.reservations.reference })
    .from(schema.reservations)
    .where(like(schema.reservations.reference, `${referencePrefix}%`));

  return new Set(rows.map((row) => row.reference));
}

async function seedReservations() {
  const batchId = process.env.RESERVATION_SEED_BATCH?.trim() || formatBatchId(new Date());
  const referencePrefix = buildDemoReferencePrefix(batchId);

  console.log("Demo reservation seed (insert-only — no deletes or updates).");
  console.log(`Batch: ${batchId} · reference prefix: ${referencePrefix}*`);

  const airportId = await loadAirportId();
  const routeMap = await loadRoutes(airportId);
  const vehicleMap = await loadVehicles();
  const extraMap = await loadExtras();
  const routeCombos = [...routeMap.values()].map((route) => ({
    districtCode: route.districtCode,
    vehicleCode: route.vehicleCode,
  }));
  const generated = buildGeneratedReservations(
    new Date(),
    routeCombos,
    batchId,
  );
  const existingReferences = await loadExistingDemoReferences(referencePrefix);

  if (existingReferences.size >= generated.length) {
    console.log(
      `Batch already complete (${existingReferences.size} reservations). Skipping — no data changed.`,
    );
    await pool.end();
    return;
  }

  if (existingReferences.size > 0) {
    console.log(
      `Resuming batch: ${existingReferences.size} reference(s) already exist, will skip duplicates.`,
    );
  }

  let created = 0;
  let skipped = 0;
  for (const seed of generated) {
    const reference = `${referencePrefix}${seed.referenceSuffix}`;

    if (existingReferences.has(reference)) {
      skipped += 1;
      continue;
    }

    const routeKey = `${seed.districtCode}:${seed.vehicleCode}`;
    const route = routeMap.get(routeKey);
    const vehicle = vehicleMap.get(seed.vehicleCode);

    if (!route || !vehicle) {
      throw new Error(
        `Missing route or vehicle for ${seed.districtCode} / ${seed.vehicleCode}. Run pnpm db:seed first.`,
      );
    }

    const transferMinor =
      seed.tripType === "ROUND_TRIP" ? route.roundTripMinor : route.oneWayMinor;

    const extraItems = seed.extras.flatMap((extraSeed, index) => {
      const extra = extraMap.get(extraSeed.code);
      if (!extra) {
        return [];
      }

      const snapshotName = resolveLocalizedName(
        extra.namesByLocale,
        extraSeed.code,
        seed.snapshotLocale,
      );

      return [
        {
          itemType: "EXTRA_SERVICE" as const,
          extraServiceId: extra.id,
          snapshotName,
          quantity: extraSeed.quantity,
          unitPriceMinor: extra.priceMinor,
          totalPriceMinor: extra.priceMinor * extraSeed.quantity,
          currency: DEFAULT_CURRENCY,
          sortOrder: index + 1,
        },
      ];
    });

    const extrasTotalMinor = extraItems.reduce(
      (sum, item) => sum + item.totalPriceMinor,
      0,
    );

    let luggageOverflowMinor = 0;
    let luggageOverflowItem:
      | {
          reservationId: string;
          itemType: "TRANSFER_VEHICLE";
          vehicleCategoryId: string;
          snapshotName: string;
          quantity: number;
          unitPriceMinor: number;
          totalPriceMinor: number;
          currency: string;
          sortOrder: number;
          isLuggageOverflowVehicle: boolean;
          createdAt: Date;
          updatedAt: Date;
        }
      | undefined;

    if (seed.includeLuggageOverflowVehicle) {
      const luggageRouteKey = `${seed.districtCode}:${seed.luggageVehicleCode}`;
      const luggageRoute = routeMap.get(luggageRouteKey);
      const luggageVehicle = vehicleMap.get(seed.luggageVehicleCode);

      if (luggageRoute && luggageVehicle) {
        luggageOverflowMinor =
          seed.tripType === "ROUND_TRIP"
            ? luggageRoute.roundTripMinor
            : luggageRoute.oneWayMinor;
        const luggageSnapshotName = resolveLocalizedName(
          luggageVehicle.namesByLocale,
          luggageVehicle.defaultName,
          pick(createRng(created + 99), SNAPSHOT_LOCALES),
        );

        luggageOverflowItem = {
          reservationId: "",
          itemType: "TRANSFER_VEHICLE",
          vehicleCategoryId: luggageVehicle.id,
          snapshotName: luggageSnapshotName,
          quantity: 1,
          unitPriceMinor: luggageOverflowMinor,
          totalPriceMinor: luggageOverflowMinor,
          currency: DEFAULT_CURRENCY,
          sortOrder: 1,
          isLuggageOverflowVehicle: true,
          createdAt: seed.createdAt,
          updatedAt: seed.createdAt,
        };
      }
    }

    const subtotalMinor =
      transferMinor + extrasTotalMinor + luggageOverflowMinor;
    const totalMinor = subtotalMinor;

    const primarySnapshotName = resolveLocalizedName(
      vehicle.namesByLocale,
      vehicle.defaultName,
      seed.snapshotLocale,
    );

    const routeLabel = `Antalya Airport → ${route.districtName}`;

    const [customer] = await db
      .insert(schema.customers)
      .values({
        firstName: seed.firstName,
        lastName: seed.lastName,
        email: seed.email,
        phone: seed.phone,
        createdAt: seed.createdAt,
        updatedAt: seed.createdAt,
      })
      .returning();

    const [reservation] = await db
      .insert(schema.reservations)
      .values({
        reference,
        status: seed.status,
        tripType: seed.tripType,
        customerId: customer.id,
        pickupLocationId: airportId,
        dropoffLocationId: route.districtId,
        routeId: route.routeId,
        outboundAt: seed.outboundAt,
        returnAt: seed.returnAt ?? undefined,
        outboundFlightNumber: seed.outboundFlightNumber,
        returnFlightNumber: seed.returnFlightNumber,
        passengerCount: seed.passengerCount,
        largeLuggageCount: seed.largeLuggageCount,
        cabinLuggageCount: seed.cabinLuggageCount,
        snapshotRouteLabel: routeLabel,
        snapshotDropoffLabel: route.districtName,
        subtotalMinor,
        totalMinor,
        currency: DEFAULT_CURRENCY,
        notes: seed.notes,
        createdAt: seed.createdAt,
        updatedAt: seed.createdAt,
      })
      .returning();

    const reservationItems: Array<{
      reservationId: string;
      itemType: "TRANSFER_VEHICLE" | "EXTRA_SERVICE";
      vehicleCategoryId?: string;
      extraServiceId?: string;
      snapshotName: string;
      quantity: number;
      unitPriceMinor: number;
      totalPriceMinor: number;
      currency: string;
      sortOrder: number;
      isLuggageOverflowVehicle?: boolean;
      createdAt: Date;
      updatedAt: Date;
    }> = [
      {
        reservationId: reservation.id,
        itemType: "TRANSFER_VEHICLE",
        vehicleCategoryId: vehicle.id,
        snapshotName: primarySnapshotName,
        quantity: 1,
        unitPriceMinor: transferMinor,
        totalPriceMinor: transferMinor,
        currency: DEFAULT_CURRENCY,
        sortOrder: 0,
        isLuggageOverflowVehicle: false,
        createdAt: seed.createdAt,
        updatedAt: seed.createdAt,
      },
    ];

    if (luggageOverflowItem) {
      reservationItems.push({
        ...luggageOverflowItem,
        reservationId: reservation.id,
        sortOrder: reservationItems.length,
      });
    }

    for (const item of extraItems) {
      reservationItems.push({
        reservationId: reservation.id,
        ...item,
        createdAt: seed.createdAt,
        updatedAt: seed.createdAt,
      });
    }

    await db.insert(schema.reservationItems).values(reservationItems);

    created += 1;
    console.log(
      `  ${reference}  ${seed.outboundAt.toISOString().slice(0, 16)}  ${seed.status}  ${seed.tripType}  ${seed.districtCode}/${seed.vehicleCode}`,
    );
  }

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const forwardOnly = generated.filter(
    (row) => row.outboundAt.getTime() >= todayStart.getTime(),
  );

  console.log(`\nCreated ${created} new demo reservation(s). Skipped ${skipped} existing.`);
  console.log(
    `Forward window (${FORWARD_OUTBOUND_DAYS} days): ${forwardOnly.length} planned in batch.`,
  );
  console.log("Existing reservations and all other DB data were left untouched.");
  await pool.end();
}

seedReservations().catch((error) => {
  console.error(error);
  process.exit(1);
});
