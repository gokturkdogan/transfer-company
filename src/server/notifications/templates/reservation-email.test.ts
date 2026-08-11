import { describe, expect, it } from "vitest";

import { buildCustomerReservationEmail } from "@/server/notifications/templates/reservation-email";
import type { ReservationNotificationPayload } from "@/server/notifications/types";

const samplePayload: ReservationNotificationPayload = {
  reservationId: "res-1",
  reference: "TR123456",
  locale: "tr",
  tripType: "ONE_WAY",
  outboundAt: new Date("2026-08-15T10:30:00.000Z"),
  snapshotRouteLabel: "Antalya Havalimanı → Belek",
  snapshotDropoffLabel: "Rixos Premium Belek",
  passengerCount: 2,
  infantCount: 1,
  largeLuggageCount: 2,
  cabinLuggageCount: 1,
  outboundFlightNumber: "TK123",
  items: [
    {
      name: "Mercedes Vito",
      quantity: 1,
      totalPriceMinor: 12000,
    },
    {
      name: "Çocuk koltuğu",
      quantity: 1,
      totalPriceMinor: 0,
    },
  ],
  customer: {
    firstName: "Ayşe",
    lastName: "Yılmaz",
    email: "ayse@example.com",
    phone: "+905551112233",
  },
  subtotalMinor: 12000,
  totalMinor: 12000,
  currency: "EUR",
};

describe("buildCustomerReservationEmail", () => {
  it("builds localized subject and html with reservation details", () => {
    const email = buildCustomerReservationEmail(samplePayload);

    expect(email.subject).toContain("TR123456");
    expect(email.html).toContain("TR123456");
    expect(email.html).toContain("Antalya Havalimanı → Belek");
    expect(email.html).toContain("Mercedes Vito");
    expect(email.text).toContain("Ayşe");
  });
});
