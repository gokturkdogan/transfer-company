import { PROJECT_TIME_ZONE } from "@/config/constants";
import { utcToZonedWallClock } from "@/lib/datetime";
import type {
  ReservationItemRecord,
  ReservationRecord,
} from "@/features/booking/server/writer";
import type { ReservationResponseDto } from "@/features/pricing/types/dto";

export function toReservationResponseDto(input: {
  reservation: ReservationRecord;
  items: ReservationItemRecord[];
}): ReservationResponseDto {
  return {
    reference: input.reservation.reference,
    status:
      input.reservation.status === "PENDING" ||
      input.reservation.status === "CONFIRMED" ||
      input.reservation.status === "CANCELLED" ||
      input.reservation.status === "COMPLETED"
        ? "PENDING"
        : "PENDING",
    tripType: input.reservation.tripType,
    outboundAt: utcToZonedWallClock(
      input.reservation.outboundAt,
      PROJECT_TIME_ZONE,
    ),
    returnAt: input.reservation.returnAt
      ? utcToZonedWallClock(input.reservation.returnAt, PROJECT_TIME_ZONE)
      : null,
    subtotalMinor: input.reservation.subtotalMinor,
    totalMinor: input.reservation.totalMinor,
    currency: input.reservation.currency,
    timeZone: PROJECT_TIME_ZONE,
    items: input.items.map((item) => ({
      type: item.itemType,
      name: item.snapshotName,
      quantity: item.quantity,
      unitPriceMinor: item.unitPriceMinor,
      totalPriceMinor: item.totalPriceMinor,
    })),
  };
}
