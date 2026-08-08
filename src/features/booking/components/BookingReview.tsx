"use client";

import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { PriceSummary } from "@/features/booking/components/PriceSummary";
import { RequiredExtrasPanel } from "@/features/booking/components/RequiredExtrasPanel";
import { useBookingFlow } from "@/features/booking/context/booking-flow-context";
import { joinWallClockDateTime } from "@/features/booking/lib/search-signature";
import { track } from "@/lib/analytics";

export function BookingReview() {
  const t = useTranslations("booking.review");
  const { state, airports, districts, dispatch, submitReservation } =
    useBookingFlow();

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

  const dropoffLabel = state.destination.useCustomDestination
    ? state.destination.customName
    : state.destination.hotelName || t("noDropoff");

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
      <p className="text-sm text-muted-foreground">{t("reservationNotice")}</p>

      <section className="space-y-2">
        <h3 className="font-semibold">{t("transfer")}</h3>
        <p>
          <span className="text-muted-foreground">{t("origin")}: </span>
          {airportName}
        </p>
        <p>
          <span className="text-muted-foreground">{t("pricingDestination")}: </span>
          {districtName}
        </p>
        <p>
          <span className="text-muted-foreground">{t("dropoff")}: </span>
          {dropoffLabel}
        </p>
        <p>{t(`tripType.${state.search.tripType}`)}</p>
        <p>{outboundAt}</p>
        {returnAt && <p>{returnAt}</p>}
      </section>

      <section className="space-y-2">
        <h3 className="font-semibold">{t("passengers")}</h3>
        <p>{state.search.passengerCount}</p>
        <p>
          {t("luggage", {
            large: state.search.largeLuggageCount,
            cabin: state.search.cabinLuggageCount,
          })}
        </p>
      </section>

      <section className="space-y-2">
        <h3 className="font-semibold">{t("vehicle")}</h3>
        <p>
          {selectedOption.quantity > 1
            ? `${selectedOption.quantity} × ${selectedOption.name}`
            : selectedOption.name}
        </p>
      </section>

      <RequiredExtrasPanel
        extras={selectedOption.requiredExtras}
        currency={state.quote.currency}
      />

      <section className="space-y-2">
        <h3 className="font-semibold">{t("customer")}</h3>
        <p>
          {state.customer.firstName} {state.customer.lastName}
        </p>
        <p>{state.customer.email}</p>
        <p>{state.customer.phone}</p>
      </section>

      <PriceSummary
        option={selectedOption}
        selectionTotalMinor={state.quote.selection?.quote.totalMinor}
        currency={state.quote.currency}
      />

      <div className="flex flex-wrap gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => dispatch({ type: "SET_STEP", step: "customer" })}
        >
          {t("edit")}
        </Button>
        <Button
          type="button"
          disabled={state.isSubmitting}
          onClick={() => {
            track({ name: "booking_review" });
            void submitReservation();
          }}
        >
          {state.isSubmitting ? t("submitting") : t("submit")}
        </Button>
      </div>
    </div>
  );
}
