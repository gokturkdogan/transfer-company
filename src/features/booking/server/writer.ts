import type { ReservationItemInsert } from "@/features/booking/domain/build-reservation-items";
import type { CreateCustomerInput } from "@/features/booking/server/repository";

export type CreateReservationRecordInput = {
  reference: string;
  tripType: "ONE_WAY" | "ROUND_TRIP";
  customer: CreateCustomerInput;
  pickupLocationId: string;
  dropoffLocationId: string;
  hotelLocationId?: string;
  customDestinationName?: string;
  customDestinationAddress?: string;
  snapshotDropoffLabel?: string;
  routeId: string;
  outboundAt: Date;
  returnAt?: Date;
  outboundFlightNumber?: string;
  returnFlightNumber?: string;
  passengerCount: number;
  largeLuggageCount: number;
  cabinLuggageCount: number;
  snapshotRouteLabel: string;
  subtotalMinor: number;
  totalMinor: number;
  currency: string;
  notes?: string;
  items: ReservationItemInsert[];
};

export type IdempotencyKeyRecord = {
  key: string;
  requestHash: string;
  reservationId: string;
  expiresAt: Date;
};

export type ReservationRecord = {
  id: string;
  reference: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  tripType: "ONE_WAY" | "ROUND_TRIP";
  outboundAt: Date;
  returnAt: Date | null;
  subtotalMinor: number;
  totalMinor: number;
  currency: string;
};

export type ReservationItemRecord = {
  itemType: "TRANSFER_VEHICLE" | "EXTRA_SERVICE";
  snapshotName: string;
  quantity: number;
  unitPriceMinor: number;
  totalPriceMinor: number;
};

export type BookingWriter = {
  findLocationNames(
    locationIds: string[],
    locale: string,
  ): Promise<Record<string, string>>;
  findIdempotencyKey(key: string): Promise<IdempotencyKeyRecord | null>;
  createReservationWithItems(input: {
    idempotencyKey?: string;
    requestHash?: string;
    idempotencyExpiresAt?: Date;
    reservation: CreateReservationRecordInput;
  }): Promise<{
    reservation: ReservationRecord;
    items: ReservationItemRecord[];
    replayed: boolean;
  }>;
};
