"use client";

import { CheckCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { ContactCta } from "@/components/shared/ContactCta";
import { useBookingFlow } from "@/features/booking/context/booking-flow-context";
import { joinWallClockDateTime } from "@/features/booking/lib/search-signature";
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
    <div className="mx-auto max-w-xl space-y-8 py-4 text-center">
      <div className="space-y-3">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gold/15 text-gold">
          <CheckCircle2 className="h-8 w-8" aria-hidden />
        </span>
        <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {t("title")}
        </h2>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>

      <div className="rounded-[1.25rem] border border-border/70 bg-muted/35 p-6 text-start shadow-float">
        <p className="text-sm text-muted-foreground">{t("reference")}</p>
        <p className="text-2xl font-bold tracking-wide text-foreground">
          {state.reservation.reference}
        </p>
        <div className="mt-4 space-y-1.5 text-sm text-foreground/85">
          <p>
            {airportName} → {districtName}
          </p>
          {dropoffLabel && <p>{dropoffLabel}</p>}
          <p>{outboundAt}</p>
          <p>{state.customer.email}</p>
        </div>
      </div>

      <ContactCta />
      <Link
        href="/"
        className="inline-flex text-sm font-semibold text-gold-deep underline-offset-4 hover:underline"
      >
        {t("backHome")}
      </Link>
    </div>
  );
}
