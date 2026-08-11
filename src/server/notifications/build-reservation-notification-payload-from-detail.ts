import { DEFAULT_LOCALE } from "@/config/constants";
import type { AdminReservationDetail } from "@/features/admin/server/reservation-admin-repository";
import type { ReservationNotificationPayload } from "@/server/notifications/types";

function splitCustomerName(fullName: string): {
  firstName: string;
  lastName: string;
} {
  const parts = fullName.trim().split(/\s+/);

  if (parts.length === 0) {
    return { firstName: "", lastName: "" };
  }

  if (parts.length === 1) {
    return { firstName: parts[0]!, lastName: "" };
  }

  return {
    firstName: parts[0]!,
    lastName: parts.slice(1).join(" "),
  };
}

export function buildReservationNotificationPayloadFromAdminDetail(
  detail: AdminReservationDetail,
  locale: string = DEFAULT_LOCALE,
): ReservationNotificationPayload {
  const { firstName, lastName } = splitCustomerName(detail.customerName);

  return {
    reservationId: detail.id,
    reference: detail.reference,
    locale,
    tripType: detail.tripType,
    outboundAt: detail.outboundAt,
    returnAt: detail.returnAt,
    snapshotRouteLabel: detail.snapshotRouteLabel,
    snapshotDropoffLabel:
      detail.snapshotDropoffLabel ?? detail.actualDropoffLabel,
    passengerCount: detail.passengerCount,
    infantCount: 0,
    largeLuggageCount: detail.largeLuggageCount,
    cabinLuggageCount: detail.cabinLuggageCount,
    outboundFlightNumber: detail.outboundFlightNumber ?? undefined,
    returnFlightNumber: detail.returnFlightNumber ?? undefined,
    items: detail.items.map((item) => ({
      type: item.itemType as "TRANSFER_VEHICLE" | "EXTRA_SERVICE",
      name: item.snapshotName,
      quantity: item.quantity,
      totalPriceMinor: item.totalPriceMinor,
      imageUrl: item.imageUrl,
    })),
    customer: {
      firstName,
      lastName,
      email: detail.customerEmail,
      phone: detail.customerPhone,
      whatsappPhone: detail.customerWhatsappPhone ?? undefined,
    },
    subtotalMinor: detail.subtotalMinor,
    totalMinor: detail.totalMinor,
    currency: detail.currency,
    notes: detail.notes ?? undefined,
  };
}
