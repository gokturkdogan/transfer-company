import { Pool } from "@neondatabase/serverless";
import { and, eq, inArray, like } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-serverless";

import { DEFAULT_CURRENCY } from "../src/config/constants";
import * as schema from "../src/db/schema";
import type { ReservationStatus } from "../src/db/schema/enums";

const DEMO_REFERENCE_PREFIX = "TR-ANL";

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
  oneWayMinor: number;
  roundTripMinor: number;
};

type VehicleContext = {
  id: string;
  code: string;
  name: string;
};

type ExtraContext = {
  id: string;
  code: string;
  name: string;
  priceMinor: number;
};

type ReservationSeed = {
  referenceSuffix: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: ReservationStatus;
  tripType: "ONE_WAY" | "ROUND_TRIP";
  districtCode: string;
  vehicleCode: string;
  daysFromNowOutbound: number;
  daysFromNowReturn?: number;
  daysAgoCreated: number;
  passengerCount: number;
  largeLuggageCount: number;
  cabinLuggageCount?: number;
  outboundFlightNumber?: string;
  returnFlightNumber?: string;
  notes?: string;
  extras?: Array<{ code: string; quantity: number }>;
};

const RESERVATION_SEEDS: ReservationSeed[] = [
  {
    referenceSuffix: "ANL001",
    firstName: "Ayşe",
    lastName: "Yılmaz",
    email: "ayse.yilmaz@example.com",
    phone: "+905551110001",
    status: "COMPLETED",
    tripType: "ONE_WAY",
    districtCode: "BELEK",
    vehicleCode: "VITO",
    daysFromNowOutbound: -12,
    daysAgoCreated: 20,
    passengerCount: 2,
    largeLuggageCount: 2,
    outboundFlightNumber: "PC1582",
    extras: [{ code: "CHAMPAGNE", quantity: 1 }],
  },
  {
    referenceSuffix: "ANL002",
    firstName: "John",
    lastName: "Smith",
    email: "john.smith@example.com",
    phone: "+447911123456",
    status: "COMPLETED",
    tripType: "ROUND_TRIP",
    districtCode: "KEMER",
    vehicleCode: "SPRINTER",
    daysFromNowOutbound: -8,
    daysFromNowReturn: -3,
    daysAgoCreated: 25,
    passengerCount: 8,
    largeLuggageCount: 10,
    outboundFlightNumber: "BA680",
    returnFlightNumber: "BA681",
  },
  {
    referenceSuffix: "ANL003",
    firstName: "Hans",
    lastName: "Müller",
    email: "hans.mueller@example.com",
    phone: "+4915123456789",
    status: "CONFIRMED",
    tripType: "ONE_WAY",
    districtCode: "SIDE",
    vehicleCode: "SEDAN",
    daysFromNowOutbound: 5,
    daysAgoCreated: 3,
    passengerCount: 2,
    largeLuggageCount: 1,
    outboundFlightNumber: "XQ1842",
  },
  {
    referenceSuffix: "ANL004",
    firstName: "Ivan",
    lastName: "Petrov",
    email: "ivan.petrov@example.com",
    phone: "+79031234567",
    status: "PENDING",
    tripType: "ONE_WAY",
    districtCode: "ALANYA",
    vehicleCode: "VITO",
    daysFromNowOutbound: 9,
    daysAgoCreated: 1,
    passengerCount: 4,
    largeLuggageCount: 4,
  },
  {
    referenceSuffix: "ANL005",
    firstName: "Mohammed",
    lastName: "Al-Ali",
    email: "m.alali@example.com",
    phone: "+971501234567",
    status: "CANCELLED",
    tripType: "ONE_WAY",
    districtCode: "BELEK",
    vehicleCode: "VITO",
    daysFromNowOutbound: 7,
    daysAgoCreated: 6,
    passengerCount: 3,
    largeLuggageCount: 3,
    notes: "Müşteri uçuşunu iptal etti.",
  },
  {
    referenceSuffix: "ANL006",
    firstName: "Elena",
    lastName: "Rossi",
    email: "elena.rossi@example.com",
    phone: "+393331112222",
    status: "COMPLETED",
    tripType: "ONE_WAY",
    districtCode: "KEMER",
    vehicleCode: "VITO",
    daysFromNowOutbound: -18,
    daysAgoCreated: 30,
    passengerCount: 3,
    largeLuggageCount: 2,
    extras: [{ code: "CHILD_SEAT", quantity: 2 }],
  },
  {
    referenceSuffix: "ANL007",
    firstName: "Sophie",
    lastName: "Martin",
    email: "sophie.martin@example.com",
    phone: "+33612345678",
    status: "CONFIRMED",
    tripType: "ROUND_TRIP",
    districtCode: "SIDE",
    vehicleCode: "VITO",
    daysFromNowOutbound: 11,
    daysFromNowReturn: 18,
    daysAgoCreated: 4,
    passengerCount: 5,
    largeLuggageCount: 5,
    outboundFlightNumber: "AF1390",
    returnFlightNumber: "AF1391",
  },
  {
    referenceSuffix: "ANL008",
    firstName: "James",
    lastName: "Wilson",
    email: "james.wilson@example.com",
    phone: "+12025550111",
    status: "PENDING",
    tripType: "ONE_WAY",
    districtCode: "ALANYA",
    vehicleCode: "SEDAN",
    daysFromNowOutbound: 14,
    daysAgoCreated: 0,
    passengerCount: 1,
    largeLuggageCount: 1,
  },
  {
    referenceSuffix: "ANL009",
    firstName: "Fatma",
    lastName: "Kaya",
    email: "fatma.kaya@example.com",
    phone: "+905559876543",
    status: "COMPLETED",
    tripType: "ROUND_TRIP",
    districtCode: "BELEK",
    vehicleCode: "VITO",
    daysFromNowOutbound: -25,
    daysFromNowReturn: -20,
    daysAgoCreated: 35,
    passengerCount: 4,
    largeLuggageCount: 4,
    outboundFlightNumber: "TK2410",
    returnFlightNumber: "TK2411",
  },
  {
    referenceSuffix: "ANL010",
    firstName: "Mehmet",
    lastName: "Demir",
    email: "mehmet.demir@example.com",
    phone: "+905337654321",
    status: "CANCELLED",
    tripType: "ONE_WAY",
    districtCode: "SIDE",
    vehicleCode: "SPRINTER",
    daysFromNowOutbound: -4,
    daysAgoCreated: 10,
    passengerCount: 10,
    largeLuggageCount: 12,
    notes: "Ödeme onayı alınamadı.",
  },
  {
    referenceSuffix: "ANL011",
    firstName: "Anna",
    lastName: "Nowak",
    email: "anna.nowak@example.com",
    phone: "+48500111222",
    status: "CONFIRMED",
    tripType: "ONE_WAY",
    districtCode: "KEMER",
    vehicleCode: "VITO",
    daysFromNowOutbound: 3,
    daysAgoCreated: 2,
    passengerCount: 2,
    largeLuggageCount: 2,
    extras: [{ code: "CHAMPAGNE", quantity: 1 }],
  },
  {
    referenceSuffix: "ANL012",
    firstName: "David",
    lastName: "Brown",
    email: "david.brown@example.com",
    phone: "+447700900123",
    status: "COMPLETED",
    tripType: "ONE_WAY",
    districtCode: "ALANYA",
    vehicleCode: "VITO",
    daysFromNowOutbound: -2,
    daysAgoCreated: 7,
    passengerCount: 3,
    largeLuggageCount: 3,
    outboundFlightNumber: "EZY2145",
  },
  {
    referenceSuffix: "ANL013",
    firstName: "Zeynep",
    lastName: "Arslan",
    email: "zeynep.arslan@example.com",
    phone: "+905321234567",
    status: "PENDING",
    tripType: "ROUND_TRIP",
    districtCode: "BELEK",
    vehicleCode: "SEDAN",
    daysFromNowOutbound: 6,
    daysFromNowReturn: 13,
    daysAgoCreated: 1,
    passengerCount: 2,
    largeLuggageCount: 2,
  },
  {
    referenceSuffix: "ANL014",
    firstName: "Lars",
    lastName: "Jensen",
    email: "lars.jensen@example.com",
    phone: "+4520123456",
    status: "COMPLETED",
    tripType: "ONE_WAY",
    districtCode: "SIDE",
    vehicleCode: "SPRINTER",
    daysFromNowOutbound: -45,
    daysAgoCreated: 55,
    passengerCount: 12,
    largeLuggageCount: 14,
    outboundFlightNumber: "SK2876",
  },
  {
    referenceSuffix: "ANL015",
    firstName: "Maria",
    lastName: "García",
    email: "maria.garcia@example.com",
    phone: "+34600111222",
    status: "CONFIRMED",
    tripType: "ONE_WAY",
    districtCode: "ALANYA",
    vehicleCode: "VITO",
    daysFromNowOutbound: 21,
    daysAgoCreated: 12,
    passengerCount: 4,
    largeLuggageCount: 4,
    extras: [{ code: "CHILD_SEAT", quantity: 1 }],
  },
];

function addDays(base: Date, days: number): Date {
  const result = new Date(base);
  result.setDate(result.getDate() + days);
  result.setHours(10, 30, 0, 0);
  return result;
}

async function loadAirportId(): Promise<string> {
  const [airport] = await db
    .select({ id: schema.locations.id })
    .from(schema.locations)
    .where(eq(schema.locations.code, "AYT"))
    .limit(1);

  if (!airport) {
    throw new Error("Antalya Airport (AYT) not found. Run npm run db:seed first.");
  }

  return airport.id;
}

async function loadRoutes(airportId: string): Promise<Map<string, RouteContext>> {
  const districtCodes = [...new Set(RESERVATION_SEEDS.map((seed) => seed.districtCode))];

  const rows = await db
    .select({
      routeId: schema.routes.id,
      districtId: schema.locations.id,
      districtCode: schema.locations.code,
      districtName: schema.locations.defaultName,
      vehicleCode: schema.vehicleCategories.code,
      vehicleCategoryId: schema.vehicleCategories.id,
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
        inArray(schema.locations.code, districtCodes),
        eq(schema.routePrices.currency, DEFAULT_CURRENCY),
      ),
    );

  const routeMap = new Map<string, RouteContext>();

  for (const row of rows) {
    const key = `${row.districtCode}:${row.vehicleCode}`;
    routeMap.set(key, {
      routeId: row.routeId,
      airportId,
      districtId: row.districtId,
      districtName: row.districtName,
      districtCode: row.districtCode,
      oneWayMinor: row.oneWayMinor,
      roundTripMinor: row.roundTripMinor ?? row.oneWayMinor * 2,
    });
  }

  return routeMap;
}

async function loadVehicles(): Promise<Map<string, VehicleContext>> {
  const vehicleCodes = [...new Set(RESERVATION_SEEDS.map((seed) => seed.vehicleCode))];
  const rows = await db
    .select({
      id: schema.vehicleCategories.id,
      code: schema.vehicleCategories.code,
      name: schema.vehicleCategories.defaultName,
    })
    .from(schema.vehicleCategories)
    .where(inArray(schema.vehicleCategories.code, vehicleCodes));

  return new Map(rows.map((row) => [row.code, row]));
}

async function loadExtras(): Promise<Map<string, ExtraContext>> {
  const extraCodes = [
    ...new Set(
      RESERVATION_SEEDS.flatMap((seed) => seed.extras?.map((extra) => extra.code) ?? []),
    ),
  ];

  if (extraCodes.length === 0) {
    return new Map();
  }

  const rows = await db
    .select({
      id: schema.extraServices.id,
      code: schema.extraServices.code,
      name: schema.extraServiceTranslations.name,
      priceMinor: schema.extraServicePrices.priceMinor,
    })
    .from(schema.extraServices)
    .innerJoin(
      schema.extraServiceTranslations,
      and(
        eq(schema.extraServiceTranslations.extraServiceId, schema.extraServices.id),
        eq(schema.extraServiceTranslations.locale, "tr"),
      ),
    )
    .innerJoin(
      schema.extraServicePrices,
      and(
        eq(schema.extraServicePrices.extraServiceId, schema.extraServices.id),
        eq(schema.extraServicePrices.currency, DEFAULT_CURRENCY),
      ),
    )
    .where(inArray(schema.extraServices.code, extraCodes));

  return new Map(rows.map((row) => [row.code, row]));
}

async function clearDemoReservations(): Promise<number> {
  const demoReservations = await db
    .select({ id: schema.reservations.id })
    .from(schema.reservations)
    .where(like(schema.reservations.reference, `${DEMO_REFERENCE_PREFIX}%`));

  if (demoReservations.length === 0) {
    return 0;
  }

  const reservationIds = demoReservations.map((row) => row.id);
  await db
    .delete(schema.reservations)
    .where(inArray(schema.reservations.id, reservationIds));

  return reservationIds.length;
}

async function seedReservations() {
  const airportId = await loadAirportId();
  const routeMap = await loadRoutes(airportId);
  const vehicleMap = await loadVehicles();
  const extraMap = await loadExtras();

  const removed = await clearDemoReservations();
  if (removed > 0) {
    console.log(`Removed ${removed} existing demo reservation(s).`);
  }

  const now = new Date();
  let created = 0;

  for (const seed of RESERVATION_SEEDS) {
    const routeKey = `${seed.districtCode}:${seed.vehicleCode}`;
    const route = routeMap.get(routeKey);
    const vehicle = vehicleMap.get(seed.vehicleCode);

    if (!route || !vehicle) {
      throw new Error(
        `Missing route or vehicle for ${seed.districtCode} / ${seed.vehicleCode}. Run npm run db:seed first.`,
      );
    }

    const transferMinor =
      seed.tripType === "ROUND_TRIP" ? route.roundTripMinor : route.oneWayMinor;

    const extraItems = (seed.extras ?? []).map((extraSeed, index) => {
      const extra = extraMap.get(extraSeed.code);
      if (!extra) {
        throw new Error(`Missing extra ${extraSeed.code}. Run npm run db:seed first.`);
      }

      return {
        itemType: "EXTRA_SERVICE" as const,
        extraServiceId: extra.id,
        snapshotName: extra.name,
        quantity: extraSeed.quantity,
        unitPriceMinor: extra.priceMinor,
        totalPriceMinor: extra.priceMinor * extraSeed.quantity,
        currency: DEFAULT_CURRENCY,
        sortOrder: index + 1,
      };
    });

    const extrasTotalMinor = extraItems.reduce(
      (sum, item) => sum + item.totalPriceMinor,
      0,
    );
    const subtotalMinor = transferMinor + extrasTotalMinor;
    const totalMinor = subtotalMinor;

    const outboundAt = addDays(now, seed.daysFromNowOutbound);
    const returnAt =
      seed.tripType === "ROUND_TRIP"
        ? addDays(now, seed.daysFromNowReturn ?? seed.daysFromNowOutbound + 5)
        : null;
    const createdAt = addDays(now, -seed.daysAgoCreated);
    createdAt.setHours(14, 15, 0, 0);

    const routeLabel = `Antalya Airport → ${route.districtName}`;
    const reference = `${DEMO_REFERENCE_PREFIX}${seed.referenceSuffix.slice(3)}`;

    const [customer] = await db
      .insert(schema.customers)
      .values({
        firstName: seed.firstName,
        lastName: seed.lastName,
        email: seed.email,
        phone: seed.phone,
        createdAt,
        updatedAt: createdAt,
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
        outboundAt,
        returnAt: returnAt ?? undefined,
        outboundFlightNumber: seed.outboundFlightNumber,
        returnFlightNumber: seed.returnFlightNumber,
        passengerCount: seed.passengerCount,
        largeLuggageCount: seed.largeLuggageCount,
        cabinLuggageCount: seed.cabinLuggageCount ?? 0,
        snapshotRouteLabel: routeLabel,
        snapshotDropoffLabel: route.districtName,
        subtotalMinor,
        totalMinor,
        currency: DEFAULT_CURRENCY,
        notes: seed.notes,
        createdAt,
        updatedAt: createdAt,
      })
      .returning();

    await db.insert(schema.reservationItems).values([
      {
        reservationId: reservation.id,
        itemType: "TRANSFER_VEHICLE",
        vehicleCategoryId: vehicle.id,
        snapshotName: vehicle.name,
        quantity: 1,
        unitPriceMinor: transferMinor,
        totalPriceMinor: transferMinor,
        currency: DEFAULT_CURRENCY,
        sortOrder: 0,
        createdAt,
        updatedAt: createdAt,
      },
      ...extraItems.map((item) => ({
        reservationId: reservation.id,
        ...item,
        createdAt,
        updatedAt: createdAt,
      })),
    ]);

    created += 1;
    console.log(
      `  ${reference}  ${seed.firstName} ${seed.lastName}  ${seed.status}  ${seed.tripType}  €${(totalMinor / 100).toFixed(2)}`,
    );
  }

  console.log(`\nCreated ${created} demo reservations for admin analytics.`);
  await pool.end();
}

seedReservations().catch((error) => {
  console.error(error);
  process.exit(1);
});
