import type { CreateReservationInputDto } from "@/features/booking/schemas/reservation";
import type { ReservationItemInsert } from "@/features/booking/domain/build-reservation-items";
import type { VehiclePresentationRecord } from "@/features/pricing/server/reader";
import { resolveVehicleCoverImage } from "@/features/vehicles/lib/resolve-vehicle-cover-image";
import type {
  ReservationEmailLineItem,
  ReservationNotificationPayload,
} from "@/server/notifications/types";

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
  vehiclePresentations?: VehiclePresentationRecord[];
};

function toEmailLineItem(
  item: ReservationItemInsert,
  vehiclesById: Map<string, VehiclePresentationRecord>,
): ReservationEmailLineItem {
  const base: ReservationEmailLineItem = {
    type: item.itemType,
    name: item.snapshotName,
    quantity: item.quantity,
    totalPriceMinor: item.totalPriceMinor,
  };

  if (item.itemType !== "TRANSFER_VEHICLE" || !item.vehicleCategoryId) {
    return base;
  }

  const vehicle = vehiclesById.get(item.vehicleCategoryId);

  if (!vehicle) {
    return base;
  }

  return {
    ...base,
    imageUrl: resolveVehicleCoverImage(vehicle.imageKey, vehicle.code),
    passengerCapacity: vehicle.passengerCapacity,
    largeLuggageCapacity: vehicle.largeLuggageCapacity,
    cabinLuggageCapacity: vehicle.cabinLuggageCapacity,
  };
}

export function buildReservationNotificationPayload(
  params: BuildReservationNotificationPayloadInput,
): ReservationNotificationPayload {
  const vehiclesById = new Map(
    (params.vehiclePresentations ?? []).map((vehicle) => [vehicle.id, vehicle]),
  );

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
    items: params.items.map((item) => toEmailLineItem(item, vehiclesById)),
    customer: params.input.customer,
    passengers: params.input.passengers.map((passenger) => ({
      kind: passenger.kind,
      index: passenger.index,
      fullName: passenger.fullName.trim(),
      ...(passenger.idDocument?.trim()
        ? { idDocument: passenger.idDocument.trim() }
        : {}),
    })),
    subtotalMinor: params.subtotalMinor,
    totalMinor: params.totalMinor,
    currency: params.currency,
    notes: params.input.notes?.trim() || undefined,
  };
}
