import { describe, expect, it, vi } from "vitest";

import { BookingService } from "@/features/booking/server/service";
import { QuoteService } from "@/features/pricing/server/quote-service";
import { DomainRuleError } from "@/server/errors";
import type { NotificationService } from "@/server/notifications/types";
import { createBookingWriterFake } from "@/test/fakes/booking-writer";
import { createPricingReaderFake } from "@/test/fakes/pricing-reader";
import {
  antalyaHierarchySeed,
  createLocationRepositoryFake,
} from "@/test/fakes/location-repository";
import { addMinutes } from "@/lib/datetime";

const notificationService: NotificationService = {
  sendReservationReceived: vi.fn(async () => undefined),
  sendNewReservationToAdmin: vi.fn(async () => undefined),
};

const baseInput = {
  routeId: "route-1",
  originAirportId: "airport-ayt",
  destinationDistrictId: "district-belek",
  tripType: "ONE_WAY" as const,
  outboundAt: addMinutes(new Date(), 120),
  passengerCount: 2,
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
  locale: "en",
};

function createHierarchyService() {
  const pricingReader = createPricingReaderFake({
    findRouteById: async () => ({
      id: "route-1",
      originLocationId: "airport-ayt",
      destinationLocationId: "district-belek",
      isActive: true,
    }),
  });
  const bookingWriter = createBookingWriterFake({
    findLocationNames: async () => ({
      "airport-ayt": "Antalya Airport",
      "district-belek": "Belek",
      "district-alanya": "Alanya",
    }),
  });
  const locationRepository = createLocationRepositoryFake(antalyaHierarchySeed);

  const service = new BookingService(
    bookingWriter,
    new QuoteService(pricingReader),
    pricingReader,
    locationRepository,
    notificationService,
  );

  return { service, bookingWriter, pricingReader };
}

describe("BookingService hierarchical locations", () => {
  it("rejects a hotel from another district", async () => {
    const { service } = createHierarchyService();

    await expect(
      service.createReservation(
        {
          ...baseInput,
          hotelLocationId: "hotel-alanya",
        },
        { idempotencyKey: "hotel-attack" },
      ),
    ).rejects.toBeInstanceOf(DomainRuleError);
  });

  it("keeps district pricing when a hotel is selected", async () => {
    const { service } = createHierarchyService();

    const withMaxx = await service.createReservation(
      {
        ...baseInput,
        hotelLocationId: "hotel-maxx",
      },
      { idempotencyKey: "hotel-maxx" },
    );

    const withRegnum = await service.createReservation(
      {
        ...baseInput,
        hotelLocationId: "hotel-regnum",
      },
      { idempotencyKey: "hotel-regnum" },
    );

    expect(withMaxx.totalMinor).toBe(withRegnum.totalMinor);
    expect(withMaxx.totalMinor).toBe(10_000);
  });

  it("keeps district pricing for custom drop-off destinations", async () => {
    const { service } = createHierarchyService();

    const result = await service.createReservation(
      {
        ...baseInput,
        customDestination: {
          name: "Private Villa",
          address: "Belek side street",
        },
      },
      { idempotencyKey: "custom-dropoff" },
    );

    expect(result.totalMinor).toBe(10_000);
  });

  it("persists reverse-direction pickup and drop-off snapshots", async () => {
    const { service, bookingWriter } = createHierarchyService();

    await service.createReservation(
      {
        ...baseInput,
        isReverseDirection: true,
        hotelLocationId: "hotel-maxx",
      },
      { idempotencyKey: "snapshot-reverse" },
    );

    const stored = bookingWriter.capturedReservationInputs[0]!;

    expect(stored.pickupLocationId).toBe("hotel-maxx");
    expect(stored.dropoffLocationId).toBe("airport-ayt");
    expect(stored.snapshotRouteLabel).toBe("Belek → Antalya Airport");
    expect(stored.snapshotDropoffLabel).toBe("Antalya Airport");
  });

  it("persists district, hotel and drop-off snapshots", async () => {
    const { service, bookingWriter } = createHierarchyService();

    await service.createReservation(
      {
        ...baseInput,
        hotelLocationId: "hotel-maxx",
      },
      { idempotencyKey: "snapshot-hotel" },
    );

    const stored = bookingWriter.capturedReservationInputs[0]!;

    expect(stored.dropoffLocationId).toBe("district-belek");
    expect(stored.hotelLocationId).toBe("hotel-maxx");
    expect(stored.snapshotRouteLabel).toBe("Antalya Airport → Belek");
    expect(stored.snapshotDropoffLabel).toBe("Maxx Royal");
  });

  it("uses custom destination name for drop-off snapshot", async () => {
    const { service, bookingWriter } = createHierarchyService();

    await service.createReservation(
      {
        ...baseInput,
        customDestination: {
          name: "Private Villa",
        },
      },
      { idempotencyKey: "snapshot-custom" },
    );

    const stored = bookingWriter.capturedReservationInputs[0]!;

    expect(stored.snapshotDropoffLabel).toBe("Private Villa");
    expect(stored.hotelLocationId).toBeUndefined();
  });
});
