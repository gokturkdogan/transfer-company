import { describe, expect, it, vi } from "vitest";

import { BookingService } from "@/features/booking/server/service";
import { QuoteService } from "@/features/pricing/server/quote-service";
import { DomainRuleError } from "@/server/errors";
import type { NotificationService } from "@/server/notifications/types";
import { createBookingWriterFake } from "@/test/fakes/booking-writer";
import { createPricingReaderFake } from "@/test/fakes/pricing-reader";
import { addMinutes } from "@/lib/datetime";
import type { LocationRepository } from "@/features/locations/server/repository";

const notificationService: NotificationService = {
  sendReservationReceived: vi.fn(async () => undefined),
  sendNewReservationToAdmin: vi.fn(async () => undefined),
  sendReservationStatusUpdate: vi.fn(async () => undefined),
};

function createLocationRepositoryFake(): LocationRepository {
  return {
    findById: vi.fn(async (id: string) => ({
      id,
      type: id.startsWith("hotel") ? "HOTEL" : id.startsWith("pickup") || id.startsWith("origin") ? "AIRPORT" : "DISTRICT",
      code: id,
      name: id,
      parentId: id.startsWith("hotel") ? "dropoff-1" : null,
      address: null,
      latitude: null,
      longitude: null,
      sortOrder: 0,
      isActive: true,
    })),
  } as unknown as LocationRepository;
}

function createService(overrides?: {
  pricing?: Partial<ReturnType<typeof createPricingReaderFake>>;
  booking?: Partial<ReturnType<typeof createBookingWriterFake>>;
}) {
  const pricingReader = createPricingReaderFake(overrides?.pricing);
  const bookingWriter = createBookingWriterFake(overrides?.booking);
  const locationRepository = createLocationRepositoryFake();

  const service = new BookingService(
    bookingWriter,
    new QuoteService(pricingReader),
    pricingReader,
    locationRepository,
    notificationService,
  );

  return { service, pricingReader, bookingWriter, locationRepository };
}

const baseInput = {
  routeId: "route-1",
  originAirportId: "pickup-1",
  destinationDistrictId: "dropoff-1",
  tripType: "ONE_WAY" as const,
  outboundAt: addMinutes(new Date(), 120),
  passengerCount: 2,
  infantCount: 0,
  largeLuggageCount: 0,
  cabinLuggageCount: 0,
  vehicles: [{ vehicleCategoryId: "vehicle-1", quantity: 1 }],
  extras: [],
  customer: {
    firstName: "Ada",
    lastName: "Lovelace",
    email: "ada@example.com",
    phone: "+905551112233",
  },
  passengers: [
    { kind: "adult" as const, index: 1, fullName: "Ada Lovelace" },
    { kind: "adult" as const, index: 2, fullName: "Grace Hopper" },
  ],
  locale: "en",
};

describe("BookingService security", () => {
  it("ignores fake client quoted total", async () => {
    const { service } = createService();

    const result = await service.createReservation(
      {
        ...baseInput,
        clientQuotedTotalMinor: 1,
      },
      { idempotencyKey: "key-1" },
    );

    expect(result.totalMinor).toBe(10_000);
  });

  it("rejects inactive route", async () => {
    const { service } = createService({
      pricing: {
        findRouteById: async () => ({
          id: "route-1",
          originLocationId: "pickup-1",
          destinationLocationId: "dropoff-1",
          isActive: false,
        }),
      },
    });

    await expect(
      service.createReservation(baseInput, { idempotencyKey: "key-2" }),
    ).rejects.toBeInstanceOf(DomainRuleError);
  });

  it("rejects inactive vehicle", async () => {
    const { service } = createService({
      pricing: {
        findVehicleCategoryById: async () => ({
          id: "vehicle-1",
          isActive: false,
          defaultName: "Sedan",
          passengerCapacity: 4,
          largeLuggageCapacity: 4,
          cabinLuggageCapacity: 2,
        }),
      },
    });

    await expect(
      service.createReservation(baseInput, { idempotencyKey: "key-3" }),
    ).rejects.toBeInstanceOf(DomainRuleError);
  });

  it("rejects over-capacity booking", async () => {
    const { service } = createService();

    await expect(
      service.createReservation(
        {
          ...baseInput,
          passengerCount: 20,
          passengers: Array.from({ length: 20 }, (_, index) => ({
            kind: "adult" as const,
            index: index + 1,
            fullName: `Passenger ${index + 1}`,
          })),
        },
        { idempotencyKey: "key-4" },
      ),
    ).rejects.toBeInstanceOf(DomainRuleError);
  });

  it("rejects non-customer-selectable extra", async () => {
    const { service } = createService();

    await expect(
      service.createReservation(
        {
          ...baseInput,
          extras: [{ extraServiceId: "luggage-extra-1", quantity: 1 }],
        },
        { idempotencyKey: "key-5" },
      ),
    ).rejects.toBeInstanceOf(DomainRuleError);
  });

  it("rejects invalid extra quantity", async () => {
    const { service } = createService();

    await expect(
      service.createReservation(
        {
          ...baseInput,
          extras: [{ extraServiceId: "child-seat-1", quantity: 99 }],
        },
        { idempotencyKey: "key-6" },
      ),
    ).rejects.toBeInstanceOf(DomainRuleError);
  });

  it("cannot remove required luggage vehicle by under-selecting", async () => {
    const { service } = createService();

    const result = await service.createReservation(
      {
        ...baseInput,
        largeLuggageCount: 12,
        extras: [],
      },
      { idempotencyKey: "key-7" },
    );

    const luggageLine = result.items.find(
      (item) => item.type === "EXTRA_SERVICE",
    );

    expect(luggageLine).toBeDefined();
    expect(luggageLine!.quantity).toBeGreaterThan(0);
    expect(result.totalMinor).toBeGreaterThan(10_000);
  });

  it("persists snapshot prices matching authoritative calculation", async () => {
    const { service } = createService();

    const result = await service.createReservation(baseInput, {
      idempotencyKey: "key-8",
    });

    expect(result.items[0]?.totalPriceMinor).toBe(10_000);
    expect(result.totalMinor).toBe(10_000);
  });
});

describe("BookingService idempotency", () => {
  it("does not create duplicate reservation for same key", async () => {
    const { service, bookingWriter } = createService();

    const first = await service.createReservation(baseInput, {
      idempotencyKey: "dup-key",
    });
    const second = await service.createReservation(baseInput, {
      idempotencyKey: "dup-key",
    });

    expect(second.reference).toBe(first.reference);
    expect(bookingWriter.reservations).toHaveLength(1);
  });
});

describe("BookingService transaction consistency", () => {
  it("does not persist reservation when item insertion fails", async () => {
    const bookingWriter = createBookingWriterFake();
    bookingWriter.failItemInsert = true;

    const pricingReader = createPricingReaderFake();
    const service = new BookingService(
      bookingWriter,
      new QuoteService(pricingReader),
      pricingReader,
      createLocationRepositoryFake(),
      notificationService,
    );

    await expect(
      service.createReservation(baseInput, { idempotencyKey: "key-tx" }),
    ).rejects.toThrow("Item insert failed");

    expect(bookingWriter.reservations).toHaveLength(0);
  });
});
