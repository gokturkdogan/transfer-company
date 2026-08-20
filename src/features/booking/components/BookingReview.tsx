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
import { buildOrderPricing } from "@/features/booking/lib/build-order-pricing";
import { getSelectedVehicleOptions } from "@/features/booking/lib/vehicle-selection";
import { useBookingFlow } from "@/features/booking/context/booking-flow-context";
import { formatPrice } from "@/features/booking/lib/format-price";
import { formatDateTimeLabel } from "@/features/booking/lib/search-datetime";
import { resolveTransferEndpointLabels } from "@/features/booking/lib/route-direction";
import { resolvePassengerKindLabel } from "@/features/booking/lib/passenger-details";
import { formatInternationalPhone } from "@/lib/phone/format";

export function BookingReview() {
  const t = useTranslations("booking.review");
  const tPassengers = useTranslations("booking.passengers");
  const tHotel = useTranslations("booking.hotel");
  const tExtras = useTranslations("booking.extras");
  const locale = useLocale();
  const { state, airports, districts } = useBookingFlow();

  const selectedOptions = getSelectedVehicleOptions(
    state.selectedVehicles,
    state.quote?.options ?? [],
  );
  const selectedOption = selectedOptions[0];

  if (!state.quote || !selectedOption || state.selectedVehicles.length === 0) {
    return null;
  }

  const pricing = buildOrderPricing(
    state.quote,
    state.selectedVehicles,
    state.selectedExtras,
    locale,
  );

  const vehicleSummaryLabel = state.selectedVehicles
    .map((selection) => {
      const option = state.quote!.options.find(
        (item) => item.vehicleCategoryId === selection.vehicleCategoryId,
      );

      if (!option) {
        return null;
      }

      return selection.quantity > 1
        ? `${selection.quantity} × ${option.name}`
        : option.name;
    })
    .filter(Boolean)
    .join(" · ");

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
  const cardVariant = "surface" as const;

  return (
    <div className="space-y-4">
      <p className="rounded-xl border border-gold/20 bg-gold/5 px-3.5 py-2.5 text-xs leading-relaxed text-muted-foreground">
        {t("reservationNotice")}
      </p>

      <div className="grid gap-3 lg:grid-cols-2">
        <SummaryCard icon={PlaneLanding} title={t("transfer")} variant={cardVariant}>
          <div className="space-y-0.5">
            <SummaryFactRow
              label={t("origin")}
              value={endpoints.displayOrigin}
              icon={MapPin}
              variant={cardVariant}
            />
            <SummaryFactRow
              label={t("pricingDestination")}
              value={endpoints.displayDestination}
              icon={MapPin}
              variant={cardVariant}
            />
            <SummaryFactRow
              label={
                state.search.isReverseDirection ? t("pickup") : t("dropoff")
              }
              value={detailLabel}
              icon={MapPin}
              variant={cardVariant}
            />
            {state.destination.useCustomDestination &&
            state.destination.customAddress.trim() ? (
              <SummaryFactRow
                label={tHotel("customAddress")}
                value={state.destination.customAddress.trim()}
                variant={cardVariant}
              />
            ) : null}
            <SummaryFactRow
              label={t("tripTypeLabel")}
              value={t(`tripType.${state.search.tripType}`)}
              variant={cardVariant}
            />
            <SummaryFactRow
              label={t("outbound")}
              value={outboundAt}
              variant={cardVariant}
            />
            {returnAt ? (
              <SummaryFactRow
                label={t("return")}
                value={returnAt}
                variant={cardVariant}
              />
            ) : null}
            {state.flight.outboundFlightNumber.trim() ? (
              <SummaryFactRow
                label={t("flightNumber")}
                value={state.flight.outboundFlightNumber.trim()}
                icon={Plane}
                variant={cardVariant}
              />
            ) : null}
            {state.search.tripType === "ROUND_TRIP" ? (
              <SummaryFactRow
                label={t("returnFlightNumber")}
                value={state.flight.returnFlightNumber.trim()}
                icon={Plane}
                variant={cardVariant}
              />
            ) : null}
            {luggageSummary ? (
              <SummaryFactRow
                label={t("luggage")}
                value={luggageSummary}
                icon={Luggage}
                variant={cardVariant}
              />
            ) : null}
          </div>
        </SummaryCard>

        <SummaryCard icon={Users} title={t("passengers")} variant={cardVariant}>
          <div className="space-y-0.5">
            <SummaryFactRow
              label={t("guests")}
              value={guestsSummary}
              variant={cardVariant}
            />
            {state.passengers.map((passenger) => {
              const label = resolvePassengerKindLabel(passenger, {
                adult: (index) => tPassengers("adultLabel", { index }),
                child: (index) => tPassengers("childLabel", { index }),
                infant: (index) => tPassengers("infantLabel", { index }),
              });
              const value = passenger.idDocument.trim()
                ? `${passenger.fullName} (${passenger.idDocument.trim()})`
                : passenger.fullName;

              return (
                <SummaryFactRow
                  key={`${passenger.kind}-${passenger.index}`}
                  label={label}
                  value={value}
                  variant={cardVariant}
                />
              );
            })}
            <SummaryFactRow
              label={t("vehicle")}
              value={vehicleSummaryLabel}
              icon={Car}
              variant={cardVariant}
            />
          </div>
        </SummaryCard>
      </div>

      <SummaryCard icon={UserRound} title={t("customer")} variant={cardVariant}>
        <div className="space-y-0.5">
          <SummaryFactRow
            label={t("name")}
            value={state.customer.fullName.trim()}
            variant={cardVariant}
          />
          <SummaryFactRow
            label={t("email")}
            value={state.customer.email}
            icon={Mail}
            variant={cardVariant}
          />
          <SummaryFactRow
            label={t("phone")}
            value={formatInternationalPhone(
              state.customer.phoneCountryCode,
              state.customer.phone,
            )}
            icon={Phone}
            variant={cardVariant}
          />
          {state.customer.secondaryPhone.trim() ? (
            <SummaryFactRow
              label={t("secondaryPhone")}
              value={formatInternationalPhone(
                state.customer.secondaryPhoneCountryCode,
                state.customer.secondaryPhone,
              )}
              icon={Phone}
              variant={cardVariant}
            />
          ) : null}
        </div>
      </SummaryCard>

      {pricing.hasExtras ? (
        <SummaryCard icon={Sparkles} title={t("extras")} variant={cardVariant}>
          <ul className="space-y-2">
            {pricing.allExtras.map((extra) => (
              <li
                key={extra.id}
                className="flex items-start justify-between gap-3 py-1"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {extra.name}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {tExtras("quantity", { count: extra.quantity })}
                    {" · "}
                    {extra.required ? tExtras("required") : t("optionalExtra")}
                  </p>
                </div>
                <span className="shrink-0 text-sm font-medium text-gold-deep">
                  {formatPrice(extra.totalPriceMinor, pricing.currency, locale)}
                </span>
              </li>
            ))}
          </ul>
        </SummaryCard>
      ) : null}

      {trimmedNotes ? (
        <SummaryCard icon={NotebookPen} title={t("notes")} variant={cardVariant}>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
            {trimmedNotes}
          </p>
        </SummaryCard>
      ) : null}

      <AcceptedPaymentCurrenciesNotice />
    </div>
  );
}
