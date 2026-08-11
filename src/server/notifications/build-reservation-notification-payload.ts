import type { CreateReservationInputDto } from "@/features/booking/schemas/reservation";
import type { ReservationItemInsert } from "@/features/booking/domain/build-reservation-items";
import type { ReservationNotificationPayload } from "@/server/notifications/types";

type BuildReservationNotificationPayloadInput = {
  reservationId: string;
  reference: string;
  input: CreateReservationInputDto;
  snapshotRouteLabel: string;
  snapshotDropoffLabel?: string;
  subtotalMinor: number;
  totalMinor: number;
  currency: string;
  items: ReservationItemInsert[];
};

export function buildReservationNotificationPayload(
  params: BuildReservationNotificationPayloadInput,
): ReservationNotificationPayload {
  return {
    reservationId: params.reservationId,
    reference: params.reference,
    locale: params.input.locale,
    tripType: params.input.tripType,
    outboundAt: params.input.outboundAt,
    returnAt: params.input.returnAt,
    snapshotRouteLabel: params.snapshotRouteLabel,
    snapshotDropoffLabel: params.snapshotDropoffLabel,
    passengerCount: params.input.passengerCount,
    infantCount: params.input.infantCount,
    largeLuggageCount: params.input.largeLuggageCount,
    cabinLuggageCount: params.input.cabinLuggageCount,
    outboundFlightNumber: params.input.outboundFlightNumber,
    returnFlightNumber: params.input.returnFlightNumber,
    items: params.items.map((item) => ({
      name: item.snapshotName,
      quantity: item.quantity,
      totalPriceMinor: item.totalPriceMinor,
    })),
    customer: params.input.customer,
    subtotalMinor: params.subtotalMinor,
    totalMinor: params.totalMinor,
    currency: params.currency,
    notes: params.input.notes,
  };
}
