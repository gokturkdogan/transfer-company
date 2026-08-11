import { randomUUID } from "node:crypto";

import { HOMEPAGE_IMAGES } from "@/config/homepage-images";
import type { ReservationNotificationPayload } from "@/server/notifications/types";

type CreateMockReservationNotificationPayloadInput = {
  customerEmail: string;
  locale?: string;
};

export function createMockReservationNotificationPayload(
  input: CreateMockReservationNotificationPayloadInput,
): ReservationNotificationPayload {
  const outboundAt = new Date();
  outboundAt.setDate(outboundAt.getDate() + 3);
  outboundAt.setHours(14, 30, 0, 0);

  const returnAt = new Date(outboundAt);
  returnAt.setDate(returnAt.getDate() + 7);
  returnAt.setHours(11, 0, 0, 0);

  return {
    reservationId: randomUUID(),
    reference: "TRMOCK1",
    locale: input.locale ?? "tr",
    tripType: "ROUND_TRIP",
    outboundAt,
    returnAt,
    snapshotRouteLabel: "Antalya Havalimanı → Belek",
    snapshotDropoffLabel: "Rixos Premium Belek",
    passengerCount: 2,
    infantCount: 1,
    largeLuggageCount: 2,
    cabinLuggageCount: 1,
    outboundFlightNumber: "TK2421",
    returnFlightNumber: "TK2422",
    items: [
      {
        type: "TRANSFER_VEHICLE",
        name: "Mercedes-Benz Vito",
        quantity: 1,
        totalPriceMinor: 14500,
        imageUrl: HOMEPAGE_IMAGES.fleet.VITO,
        passengerCapacity: 6,
        largeLuggageCapacity: 6,
        cabinLuggageCapacity: 4,
      },
      {
        type: "EXTRA_SERVICE",
        name: "Çocuk koltuğu",
        quantity: 1,
        totalPriceMinor: 0,
      },
      {
        type: "EXTRA_SERVICE",
        name: "Meet & Greet karşılama",
        quantity: 1,
        totalPriceMinor: 2500,
      },
    ],
    customer: {
      firstName: "Test",
      lastName: "Müşteri",
      email: input.customerEmail,
      phone: "+90 555 111 22 33",
      whatsappPhone: "+90 555 999 88 77",
    },
    subtotalMinor: 17000,
    totalMinor: 17000,
    currency: "EUR",
    notes:
      "Uçuşumuz gece geç saatte iniyor, karşılamada bebek arabası için yer ayırabilir misiniz? (Bu bir örnek rezervasyondur.)",
  };
}
