"use client";

import {
  Car,
  Luggage,
  Mail,
  MapPin,
  NotebookPen,
  Phone,
  Plane,
  PlaneLanding,
  Sparkles,
  UserRound,
  Users,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { AcceptedPaymentCurrenciesNotice } from "@/features/booking/components/AcceptedPaymentCurrenciesNotice";
import { SummaryCard } from "@/features/booking/components/summary/SummaryCard";
import { SummaryFactRow } from "@/features/booking/components/summary/SummaryFactRow";
import { useBookingFlow } from "@/features/booking/context/booking-flow-context";
import { buildOrderPricing } from "@/features/booking/lib/build-order-pricing";
import { formatPrice } from "@/features/booking/lib/format-price";
import { formatDateTimeLabel } from "@/features/booking/lib/search-datetime";
import { resolveTransferEndpointLabels } from "@/features/booking/lib/route-direction";
import { formatInternationalPhone } from "@/lib/phone/format";

export function BookingReview() {
  const t = useTranslations("booking.review");
  const tPassengers = useTranslations("booking.passengers");
  const tHotel = useTranslations("booking.hotel");
  const tExtras = useTranslations("booking.extras");
  const locale = useLocale();
  const { state, airports, districts } = useBookingFlow();

  const selectedOption = state.quote?.options.find(
    (option) => option.vehicleCategoryId === state.selectedVehicleCategoryId,
  );

  if (!state.quote || !selectedOption) {
    return null;
  }

  const pricing = buildOrderPricing(
    selectedOption,
    state.quote,
    state.selectedExtras,
  );

  const airportName =
    airports.find((airport) => airport.id === state.search.originAirportId)
      ?.name ?? "";
  const districtName =
    districts.find(
      (district) => district.id === state.search.destinationDistrictId,
    )?.name ?? "";

  const hotelOrCustomLabel = state.destination.useCustomDestination
    ? state.destination.customName
    : state.destination.hotelName;

  const endpoints = resolveTransferEndpointLabels({
    search: state.search,
    airportName,
    districtName,
    hotelOrCustomLabel: hotelOrCustomLabel || undefined,
  });

  const detailLabel = hotelOrCustomLabel || t("noDropoff");
  const outboundAt = formatDateTimeLabel(
    state.search.outboundDate,
    state.search.outboundTime,
    locale,
  );
  const returnAt =
    state.search.tripType === "ROUND_TRIP"
      ? formatDateTimeLabel(
          state.search.returnDate,
          state.search.returnTime,
          locale,
        )
      : null;

  const guestsSummary = [
    t("adultsCount", { count: state.search.passengerCount }),
    state.search.childCount > 0
      ? t("childrenCount", { count: state.search.childCount })
      : null,
    state.search.infantCount > 0
      ? t("infantsCount", { count: state.search.infantCount })
      : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const luggageSummary = [
    state.search.largeLuggageCount > 0
      ? t("largeLuggageCount", { count: state.search.largeLuggageCount })
      : null,
    state.search.cabinLuggageCount > 0
      ? t("cabinLuggageCount", { count: state.search.cabinLuggageCount })
      : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const trimmedNotes = state.notes.trim();

  return (
    <div className="space-y-4">
      <p className="rounded-xl border border-gold/20 bg-gold/5 px-3.5 py-2.5 text-xs leading-relaxed text-muted-foreground">
        {t("reservationNotice")}
      </p>

      <div className="grid gap-3 lg:grid-cols-2">
        <SummaryCard icon={PlaneLanding} title={t("transfer")}>
          <div className="space-y-0.5">
            <SummaryFactRow
              label={t("origin")}
              value={endpoints.displayOrigin}
              icon={MapPin}
            />
            <SummaryFactRow
              label={t("pricingDestination")}
              value={endpoints.displayDestination}
              icon={MapPin}
            />
            <SummaryFactRow
              label={
                state.search.isReverseDirection ? t("pickup") : t("dropoff")
              }
              value={detailLabel}
              icon={MapPin}
            />
            {state.destination.useCustomDestination &&
            state.destination.customAddress.trim() ? (
              <SummaryFactRow
                label={tHotel("customAddress")}
                value={state.destination.customAddress.trim()}
              />
            ) : null}
            <SummaryFactRow
              label={t("tripTypeLabel")}
              value={t(`tripType.${state.search.tripType}`)}
            />
            <SummaryFactRow label={t("outbound")} value={outboundAt} />
            {returnAt ? (
              <SummaryFactRow label={t("return")} value={returnAt} />
            ) : null}
            {state.flight.outboundFlightNumber.trim() ? (
              <SummaryFactRow
                label={t("flightNumber")}
                value={state.flight.outboundFlightNumber.trim()}
                icon={Plane}
              />
            ) : null}
            {state.search.tripType === "ROUND_TRIP" &&
            state.flight.returnFlightNumber.trim() ? (
              <SummaryFactRow
                label={t("returnFlightNumber")}
                value={state.flight.returnFlightNumber.trim()}
                icon={Plane}
              />
            ) : null}
            {luggageSummary ? (
              <SummaryFactRow
                label={t("luggage")}
                value={luggageSummary}
                icon={Luggage}
              />
            ) : null}
          </div>
        </SummaryCard>

        <SummaryCard icon={Users} title={t("passengers")}>
          <div className="space-y-0.5">
            <SummaryFactRow label={t("guests")} value={guestsSummary} />
            {state.passengers.map((passenger) => {
              const label =
                passenger.kind === "adult"
                  ? tPassengers("adultLabel", { index: passenger.index })
                  : tPassengers("childLabel", { index: passenger.index });
              const value = passenger.idDocument.trim()
                ? `${passenger.fullName} (${passenger.idDocument.trim()})`
                : passenger.fullName;

              return (
                <SummaryFactRow
                  key={`${passenger.kind}-${passenger.index}`}
                  label={label}
                  value={value}
                />
              );
            })}
            <SummaryFactRow
              label={t("vehicle")}
              value={
                selectedOption.quantity > 1
                  ? `${selectedOption.quantity} × ${selectedOption.name}`
                  : selectedOption.name
              }
              icon={Car}
            />
          </div>
        </SummaryCard>
      </div>

      <SummaryCard icon={UserRound} title={t("customer")}>
        <div className="space-y-0.5">
          <SummaryFactRow
            label={t("name")}
            value={`${state.customer.firstName} ${state.customer.lastName}`.trim()}
          />
          <SummaryFactRow
            label={t("email")}
            value={state.customer.email}
            icon={Mail}
          />
          <SummaryFactRow
            label={t("phone")}
            value={formatInternationalPhone(
              state.customer.phoneCountryCode,
              state.customer.phone,
            )}
            icon={Phone}
          />
          {state.customer.secondaryPhone.trim() ? (
            <SummaryFactRow
              label={t("secondaryPhone")}
              value={formatInternationalPhone(
                state.customer.secondaryPhoneCountryCode,
                state.customer.secondaryPhone,
              )}
              icon={Phone}
            />
          ) : null}
        </div>
      </SummaryCard>

      {pricing.hasExtras ? (
        <SummaryCard icon={Sparkles} title={t("extras")}>
          <ul className="space-y-2">
            {pricing.allExtras.map((extra) => (
              <li
                key={extra.id}
                className="flex items-start justify-between gap-3 rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="text-xs font-medium text-white/90">
                    {extra.name}
                  </p>
                  <p className="mt-0.5 text-[10px] uppercase tracking-[0.1em] text-white/45">
                    {tExtras("quantity", { count: extra.quantity })}
                    {" · "}
                    {extra.required ? tExtras("required") : t("optionalExtra")}
                  </p>
                </div>
                <span className="shrink-0 text-xs font-semibold text-gold-light">
                  {formatPrice(extra.totalPriceMinor, pricing.currency, locale)}
                </span>
              </li>
            ))}
          </ul>
        </SummaryCard>
      ) : null}

      {trimmedNotes ? (
        <SummaryCard icon={NotebookPen} title={t("notes")}>
          <p className="whitespace-pre-wrap text-xs leading-relaxed text-white/80">
            {trimmedNotes}
          </p>
        </SummaryCard>
      ) : null}

      <AcceptedPaymentCurrenciesNotice />
    </div>
  );
}
