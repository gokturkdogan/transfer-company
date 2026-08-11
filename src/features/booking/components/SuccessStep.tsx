"use client";

import { CheckCircle2, Info } from "lucide-react";
import { useTranslations } from "next-intl";

import { AcceptedPaymentCurrenciesNotice } from "@/features/booking/components/AcceptedPaymentCurrenciesNotice";
import { ContactCta } from "@/components/shared/ContactCta";
import { useBookingFlow } from "@/features/booking/context/booking-flow-context";
import { buildSearchRouteLabel } from "@/features/booking/lib/build-search-summary";
import { resolveTransferEndpointLabels } from "@/features/booking/lib/route-direction";
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

  const routeLabel = buildSearchRouteLabel({
    airportName,
    districtName,
    isReverseDirection: state.search.isReverseDirection,
  });

  const hotelOrCustomLabel = state.destination.useCustomDestination
    ? state.destination.customName
    : state.destination.hotelName;

  const endpoints = resolveTransferEndpointLabels({
    search: state.search,
    airportName,
    districtName,
    hotelOrCustomLabel: hotelOrCustomLabel || undefined,
  });

  return (
    <div className="mx-auto max-w-xl space-y-8 py-4 text-center">
      <div className="space-y-3">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-gold/30 bg-gold/15 text-gold">
          <CheckCircle2 className="h-8 w-8" aria-hidden />
        </span>
        <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          {t("title")}
        </h2>
        <p className="text-white/70">{t("subtitle")}</p>
      </div>

      <div className="rounded-[1.25rem] border border-white/15 bg-white/8 p-6 text-start shadow-float backdrop-blur-sm">
        <p className="text-sm text-white/55">{t("reference")}</p>
        <p className="text-2xl font-bold tracking-wide text-gold-light">
          {state.reservation.reference}
        </p>
        <div className="mt-4 space-y-1.5 text-sm text-white/85">
          <p>{routeLabel}</p>
          {hotelOrCustomLabel && <p>{endpoints.pickupLabel}</p>}
          <p>{outboundAt}</p>
          <p>{state.customer.email}</p>
        </div>
      </div>

      <AcceptedPaymentCurrenciesNotice className="text-start" tone="onDark" />

      <div className="space-y-4">
        <div className="mx-auto flex max-w-md items-start gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-start">
          <Info
            className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold-light"
            aria-hidden
          />
          <p className="text-[11px] leading-snug text-white/65">
            {t("emailNotice", { email: state.customer.email })}{" "}
            <span className="text-white/45">{t("emailSpamHint")}</span>
          </p>
        </div>

        <ContactCta tone="onDark" />
      </div>

      <Link
        href="/"
        className="inline-flex text-sm font-semibold text-gold-light underline-offset-4 hover:underline"
      >
        {t("backHome")}
      </Link>
    </div>
  );
}
