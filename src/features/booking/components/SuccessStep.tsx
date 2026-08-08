"use client";

import { useTranslations } from "next-intl";

import { useBookingFlow } from "@/features/booking/context/booking-flow-context";
import { joinWallClockDateTime } from "@/features/booking/lib/search-signature";
import { ContactCta } from "@/components/shared/ContactCta";
import { Link } from "@/i18n/navigation";

export function SuccessStep() {
  const t = useTranslations("booking.success");
  const { state, airports, districts } = useBookingFlow();

  if (!state.reservation) {
    return null;
  }

  const outboundAt = joinWallClockDateTime(
    state.search.outboundDate,
    state.search.outboundTime,
  );

  const airportName =
    airports.find((airport) => airport.id === state.search.originAirportId)
      ?.name ?? "";
  const districtName =
    districts.find(
      (district) => district.id === state.search.destinationDistrictId,
    )?.name ?? "";

  const dropoffLabel = state.destination.useCustomDestination
    ? state.destination.customName
    : state.destination.hotelName;

  return (
    <div className="space-y-6 text-center">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">{t("title")}</h2>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>

      <div className="rounded-xl border border-border p-6 text-start">
        <p className="text-sm text-muted-foreground">{t("reference")}</p>
        <p className="text-2xl font-bold tracking-wide">
          {state.reservation.reference}
        </p>
        <div className="mt-4 space-y-1 text-sm">
          <p>
            {airportName} → {districtName}
          </p>
          {dropoffLabel && <p>{dropoffLabel}</p>}
          <p>{outboundAt}</p>
          <p>{state.customer.email}</p>
        </div>
      </div>

      <ContactCta />
      <Link href="/" className="text-sm font-medium underline">
        {t("backHome")}
      </Link>
    </div>
  );
}
