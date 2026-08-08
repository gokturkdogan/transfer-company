import "server-only";

import { and, eq, inArray } from "drizzle-orm";

import type { Database } from "@/db/client";
import {
  customers,
  locationTranslations,
  locations,
  reservationIdempotencyKeys,
  reservationItems,
  reservations,
} from "@/db/schema";
import type { ReservationItemInsert } from "@/features/booking/domain/build-reservation-items";
import type {
  BookingWriter,
  CreateReservationRecordInput,
  IdempotencyKeyRecord,
  ReservationItemRecord,
  ReservationRecord,
} from "@/features/booking/server/writer";
import { ConflictError, InfrastructureError } from "@/server/errors";

export type CreateCustomerInput = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  whatsappPhone?: string;
};

function isUniqueViolation(error: unknown): boolean {
  return (
    error instanceof Error &&
    "code" in error &&
    (error as { code?: string }).code === "23505"
  );
}

export class BookingRepository implements BookingWriter {
  constructor(private readonly database: Database) {}

  async findLocationNames(
    locationIds: string[],
    locale: string,
  ): Promise<Record<string, string>> {
    if (locationIds.length === 0) {
      return {};
    }

    const translations = await this.database
      .select({
        locationId: locationTranslations.locationId,
        name: locationTranslations.name,
      })
      .from(locationTranslations)
      .where(
        and(
          inArray(locationTranslations.locationId, locationIds),
          eq(locationTranslations.locale, locale),
        ),
      );

    const names: Record<string, string> = {};

    for (const translation of translations) {
      names[translation.locationId] = translation.name;
    }

    const missingIds = locationIds.filter((id) => !(id in names));

    if (missingIds.length > 0) {
      const defaults = await this.database
        .select({
          id: locations.id,
          defaultName: locations.defaultName,
        })
        .from(locations)
        .where(inArray(locations.id, missingIds));

      for (const location of defaults) {
        names[location.id] = location.defaultName;
      }
    }

    return names;
  }

  async findIdempotencyKey(key: string): Promise<IdempotencyKeyRecord | null> {
    const [record] = await this.database
      .select({
        key: reservationIdempotencyKeys.key,
        requestHash: reservationIdempotencyKeys.requestHash,
        reservationId: reservationIdempotencyKeys.reservationId,
        expiresAt: reservationIdempotencyKeys.expiresAt,
      })
      .from(reservationIdempotencyKeys)
      .where(eq(reservationIdempotencyKeys.key, key))
      .limit(1);

    if (!record || !record.reservationId) {
      return null;
    }

    return {
      key: record.key,
      requestHash: record.requestHash,
      reservationId: record.reservationId,
      expiresAt: record.expiresAt,
    };
  }

  private async loadReservationWithItems(reservationId: string): Promise<{
    reservation: ReservationRecord;
    items: ReservationItemRecord[];
  }> {
    const [reservation] = await this.database
      .select({
        id: reservations.id,
        reference: reservations.reference,
        status: reservations.status,
        tripType: reservations.tripType,
        outboundAt: reservations.outboundAt,
        returnAt: reservations.returnAt,
        subtotalMinor: reservations.subtotalMinor,
        totalMinor: reservations.totalMinor,
        currency: reservations.currency,
      })
      .from(reservations)
      .where(eq(reservations.id, reservationId))
      .limit(1);

    if (!reservation) {
      throw new InfrastructureError(
        "Reservation not found after idempotency replay",
      );
    }

    const items = await this.database
      .select({
        itemType: reservationItems.itemType,
        snapshotName: reservationItems.snapshotName,
        quantity: reservationItems.quantity,
        unitPriceMinor: reservationItems.unitPriceMinor,
        totalPriceMinor: reservationItems.totalPriceMinor,
      })
      .from(reservationItems)
      .where(eq(reservationItems.reservationId, reservationId));

    return { reservation, items };
  }

  async createReservationWithItems(input: {
    idempotencyKey?: string;
    requestHash?: string;
    idempotencyExpiresAt?: Date;
    reservation: CreateReservationRecordInput;
  }) {
    const { reservation: payload } = input;

    if (input.idempotencyKey && input.requestHash) {
      const claimed = await this.database
        .insert(reservationIdempotencyKeys)
        .values({
          key: input.idempotencyKey,
          requestHash: input.requestHash,
          expiresAt:
            input.idempotencyExpiresAt ??
            new Date(Date.now() + 24 * 60 * 60 * 1000),
        })
        .onConflictDoNothing()
        .returning({ key: reservationIdempotencyKeys.key });

      if (claimed.length === 0) {
        const existing = await this.findIdempotencyKey(input.idempotencyKey);

        if (!existing) {
          await this.waitForIdempotencyResolution(input.idempotencyKey);
          const resolved = await this.findIdempotencyKey(input.idempotencyKey);

          if (!resolved) {
            throw new InfrastructureError(
              "Idempotency key exists but reservation is not ready",
            );
          }

          if (resolved.requestHash !== input.requestHash) {
            throw new ConflictError(
              "Idempotency key was already used with a different request payload",
            );
          }

          const replayed = await this.loadReservationWithItems(
            resolved.reservationId,
          );

          return {
            ...replayed,
            replayed: true,
          };
        }

        if (existing.requestHash !== input.requestHash) {
          throw new ConflictError(
            "Idempotency key was already used with a different request payload",
          );
        }

        const replayed = await this.loadReservationWithItems(
          existing.reservationId,
        );

        return {
          ...replayed,
          replayed: true,
        };
      }
    }

    try {
      return await this.database.transaction(async (tx) => {
        const [customer] = await tx
          .insert(customers)
          .values(payload.customer)
          .returning();

        const [reservation] = await tx
          .insert(reservations)
          .values({
            reference: payload.reference,
            tripType: payload.tripType,
            customerId: customer.id,
            pickupLocationId: payload.pickupLocationId,
            dropoffLocationId: payload.dropoffLocationId,
            routeId: payload.routeId,
            outboundAt: payload.outboundAt,
            returnAt: payload.returnAt,
            outboundFlightNumber: payload.outboundFlightNumber,
            returnFlightNumber: payload.returnFlightNumber,
            passengerCount: payload.passengerCount,
            largeLuggageCount: payload.largeLuggageCount,
            cabinLuggageCount: payload.cabinLuggageCount,
            snapshotRouteLabel: payload.snapshotRouteLabel,
            hotelLocationId: payload.hotelLocationId,
            customDestinationName: payload.customDestinationName,
            customDestinationAddress: payload.customDestinationAddress,
            snapshotDropoffLabel: payload.snapshotDropoffLabel,
            subtotalMinor: payload.subtotalMinor,
            totalMinor: payload.totalMinor,
            currency: payload.currency,
            notes: payload.notes,
          })
          .returning({
            id: reservations.id,
            reference: reservations.reference,
            status: reservations.status,
            tripType: reservations.tripType,
            outboundAt: reservations.outboundAt,
            returnAt: reservations.returnAt,
            subtotalMinor: reservations.subtotalMinor,
            totalMinor: reservations.totalMinor,
            currency: reservations.currency,
          });

        if (input.idempotencyKey) {
          await tx
            .update(reservationIdempotencyKeys)
            .set({ reservationId: reservation.id })
            .where(eq(reservationIdempotencyKeys.key, input.idempotencyKey));
        }

        let items: ReservationItemRecord[] = [];

        if (payload.items.length > 0) {
          const insertedItems = await tx
            .insert(reservationItems)
            .values(
              payload.items.map((item: ReservationItemInsert) => ({
                reservationId: reservation.id,
                itemType: item.itemType,
                vehicleCategoryId: item.vehicleCategoryId,
                extraServiceId: item.extraServiceId,
                snapshotName: item.snapshotName,
                quantity: item.quantity,
                unitPriceMinor: item.unitPriceMinor,
                totalPriceMinor: item.totalPriceMinor,
                currency: item.currency,
                sortOrder: item.sortOrder,
              })),
            )
            .returning({
              itemType: reservationItems.itemType,
              snapshotName: reservationItems.snapshotName,
              quantity: reservationItems.quantity,
              unitPriceMinor: reservationItems.unitPriceMinor,
              totalPriceMinor: reservationItems.totalPriceMinor,
            });

          items = insertedItems;
        }

        return {
          reservation,
          items,
          replayed: false,
        };
      });
    } catch (error) {
      if (input.idempotencyKey) {
        await this.database
          .delete(reservationIdempotencyKeys)
          .where(eq(reservationIdempotencyKeys.key, input.idempotencyKey));
      }

      if (isUniqueViolation(error)) {
        throw error;
      }

      throw error;
    }
  }

  private async waitForIdempotencyResolution(
    key: string,
    attempts = 5,
  ): Promise<void> {
    for (let attempt = 0; attempt < attempts; attempt += 1) {
      const existing = await this.findIdempotencyKey(key);

      if (existing) {
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, 50 * (attempt + 1)));
    }
  }
}
