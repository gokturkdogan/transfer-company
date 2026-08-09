"use client";

import { useTranslations } from "next-intl";

import { AcceptedPaymentCurrenciesNotice } from "@/features/booking/components/AcceptedPaymentCurrenciesNotice";
import { BookingStepHeader } from "@/features/booking/components/BookingStepHeader";
import { PriceSummary } from "@/features/booking/components/PriceSummary";
import { RequiredExtrasPanel } from "@/features/booking/components/RequiredExtrasPanel";
import { useBookingFlow } from "@/features/booking/context/booking-flow-context";
import { formatInternationalPhone } from "@/lib/phone/format";
import { resolveTransferEndpointLabels } from "@/features/booking/lib/route-direction";
import { joinWallClockDateTime } from "@/features/booking/lib/search-signature";

export function BookingReview() {
  const t = useTranslations("booking.review");
  const tPassengers = useTranslations("booking.passengers");
  const tPage = useTranslations("booking.page");
  const { state, airports, districts } = useBookingFlow();

  const selectedOption = state.quote?.options.find(
    (option) => option.vehicleCategoryId === state.selectedVehicleCategoryId,
  );

  if (!state.quote || !selectedOption) {
    return null;
  }

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

  const outboundAt = joinWallClockDateTime(
    state.search.outboundDate,
    state.search.outboundTime,
  );
  const returnAt =
    state.search.tripType === "ROUND_TRIP"
      ? joinWallClockDateTime(state.search.returnDate, state.search.returnTime)
      : null;

  return (
    <div className="space-y-6">
      <BookingStepHeader
        eyebrow={tPage("reviewEyebrow")}
        title={t("title")}
        subtitle={t("reservationNotice")}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <ReviewSection title={t("transfer")}>
          <ReviewRow label={t("origin")} value={endpoints.displayOrigin} />
          <ReviewRow
            label={t("pricingDestination")}
            value={endpoints.displayDestination}
          />
          <ReviewRow
            label={
              state.search.isReverseDirection ? t("pickup") : t("dropoff")
            }
            value={detailLabel}
          />
          <ReviewRow label={t("tripTypeLabel")} value={t(`tripType.${state.search.tripType}`)} />
          <ReviewRow label={t("outbound")} value={outboundAt} />
          {returnAt && <ReviewRow label={t("return")} value={returnAt} />}
        </ReviewSection>

        <ReviewSection title={t("passengers")}>
          <ReviewRow
            label={t("guests")}
            value={t("adultsChildren", {
              adults: state.search.passengerCount,
              children: state.search.childCount,
            })}
          />
          {state.passengers.map((passenger) => {
            const label =
              passenger.kind === "adult"
                ? tPassengers("adultLabel", { index: passenger.index })
                : tPassengers("childLabel", { index: passenger.index });
            const value = passenger.idDocument.trim()
              ? `${passenger.fullName} (${passenger.idDocument.trim()})`
              : passenger.fullName;

            return <ReviewRow key={`${passenger.kind}-${passenger.index}`} label={label} value={value} />;
          })}
          <ReviewRow
            label={t("vehicle")}
            value={
              selectedOption.quantity > 1
                ? `${selectedOption.quantity} × ${selectedOption.name}`
                : selectedOption.name
            }
          />
        </ReviewSection>
      </div>

      <ReviewSection title={t("customer")}>
        <ReviewRow
          label={t("name")}
          value={`${state.customer.firstName} ${state.customer.lastName}`}
        />
        <ReviewRow label={t("email")} value={state.customer.email} />
        <ReviewRow
          label={t("phone")}
          value={formatInternationalPhone(
            state.customer.phoneCountryCode,
            state.customer.phone,
          )}
        />
      </ReviewSection>

      <RequiredExtrasPanel
        extras={selectedOption.requiredExtras}
        currency={state.quote.currency}
      />

      <PriceSummary
        option={selectedOption}
        selectionTotalMinor={state.quote.selection?.quote.totalMinor}
        currency={state.quote.currency}
      />

      <AcceptedPaymentCurrenciesNotice />
    </div>
  );
}

function ReviewSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border/70 bg-muted/35 p-4">
      <h3 className="mb-3 text-sm font-bold uppercase tracking-[0.12em] text-gold-deep">
        {title}
      </h3>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 text-sm sm:flex-row sm:justify-between sm:gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground sm:text-end">{value}</span>
    </div>
  );
}
