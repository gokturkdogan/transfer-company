import type {
  BookingWriter,
  CreateReservationRecordInput,
  IdempotencyKeyRecord,
  ReservationItemRecord,
  ReservationRecord,
} from "@/features/booking/server/writer";
import { ConflictError } from "@/server/errors";

type StoredReservation = {
  reservation: ReservationRecord;
  items: ReservationItemRecord[];
};

export function createBookingWriterFake(
  overrides: Partial<BookingWriter> = {},
): BookingWriter & {
  reservations: StoredReservation[];
  capturedReservationInputs: CreateReservationRecordInput[];
  idempotencyKeys: Map<string, IdempotencyKeyRecord>;
  failItemInsert: boolean;
} {
  const state = {
    reservations: [] as StoredReservation[],
    capturedReservationInputs: [] as CreateReservationRecordInput[],
    idempotencyKeys: new Map<string, IdempotencyKeyRecord>(),
    failItemInsert: false,
  };

  const writer = {
    get reservations() {
      return state.reservations;
    },
    get capturedReservationInputs() {
      return state.capturedReservationInputs;
    },
    get idempotencyKeys() {
      return state.idempotencyKeys;
    },
    get failItemInsert() {
      return state.failItemInsert;
    },
    set failItemInsert(value: boolean) {
      state.failItemInsert = value;
    },

    async findLocationNames(locationIds: string[]) {
      return Object.fromEntries(
        locationIds.map((id) => [id, id === "pickup-1" ? "Airport" : "Hotel"]),
      );
    },

    async findIdempotencyKey(key: string) {
      return state.idempotencyKeys.get(key) ?? null;
    },

    async createReservationWithItems(input: {
      idempotencyKey?: string;
      requestHash?: string;
      idempotencyExpiresAt?: Date;
      reservation: CreateReservationRecordInput;
    }) {
      if (input.idempotencyKey && input.requestHash) {
        const existing = state.idempotencyKeys.get(input.idempotencyKey);

        if (existing) {
          if (existing.requestHash !== input.requestHash) {
            throw new ConflictError(
              "Idempotency key was already used with a different request payload",
            );
          }

          const stored = state.reservations.find(
            (entry) => entry.reservation.id === existing.reservationId,
          );

          if (!stored) {
            throw new Error("Missing replay reservation");
          }

          return {
            ...stored,
            replayed: true,
          };
        }

        state.idempotencyKeys.set(input.idempotencyKey, {
          key: input.idempotencyKey,
          requestHash: input.requestHash,
          reservationId: "pending",
          expiresAt: input.idempotencyExpiresAt!,
        });
      }

      if (state.failItemInsert) {
        if (input.idempotencyKey) {
          state.idempotencyKeys.delete(input.idempotencyKey);
        }

        throw new Error("Item insert failed");
      }

      state.capturedReservationInputs.push(input.reservation);

      const reservation: ReservationRecord = {
        id: `reservation-${state.reservations.length + 1}`,
        reference: input.reservation.reference,
        status: "PENDING",
        tripType: input.reservation.tripType,
        outboundAt: input.reservation.outboundAt,
        returnAt: input.reservation.returnAt ?? null,
        subtotalMinor: input.reservation.subtotalMinor,
        totalMinor: input.reservation.totalMinor,
        currency: input.reservation.currency,
      };

      const items: ReservationItemRecord[] = input.reservation.items.map(
        (item: CreateReservationRecordInput["items"][number]) => ({
          itemType: item.itemType,
          snapshotName: item.snapshotName,
          quantity: item.quantity,
          unitPriceMinor: item.unitPriceMinor,
          totalPriceMinor: item.totalPriceMinor,
        }),
      );

      const stored = { reservation, items };
      state.reservations.push(stored);

      if (input.idempotencyKey && input.requestHash && input.idempotencyExpiresAt) {
        state.idempotencyKeys.set(input.idempotencyKey, {
          key: input.idempotencyKey,
          requestHash: input.requestHash,
          reservationId: reservation.id,
          expiresAt: input.idempotencyExpiresAt,
        });
      }

      return {
        ...stored,
        replayed: false,
      };
    },

    ...overrides,
  };

  return writer as BookingWriter & {
    reservations: StoredReservation[];
    capturedReservationInputs: CreateReservationRecordInput[];
    idempotencyKeys: Map<string, IdempotencyKeyRecord>;
    failItemInsert: boolean;
  };
}
