"use client";

import { PlaneLanding } from "lucide-react";
import { useTranslations } from "next-intl";

import { BookingFormField } from "@/features/booking/components/BookingFormField";
import { BookingFormSection } from "@/features/booking/components/BookingFormSection";
import { BookingInput } from "@/features/booking/components/BookingInput";
import { CustomDestinationFields } from "@/features/booking/components/CustomDestinationFields";
import { FormDateTimeField } from "@/features/booking/components/FormDateTimeField";
import { HotelSelector } from "@/features/booking/components/HotelSelector";
import { LuggageCountField } from "@/features/booking/components/LuggageCountField";
import { useBookingFlow } from "@/features/booking/context/booking-flow-context";

export function TransferDetailsForm() {
  const t = useTranslations("booking.transfer");
  const { state, dispatch, updateOutboundSchedule } = useBookingFlow();
  const { flight, search } = state;

  return (
    <BookingFormSection
      title={t("title")}
      description={t("subtitle")}
      icon={<PlaneLanding className="h-4 w-4" aria-hidden />}
    >
      <div className="space-y-4">
        <div className="grid gap-4 lg:grid-cols-3">
          <FormDateTimeField
            id="landing-datetime"
            label={t("landingDateTime")}
            required
            dateValue={search.outboundDate}
            timeValue={search.outboundTime}
            disabled={state.isLoadingQuote}
            onCommit={(outboundDate, outboundTime) => {
              void updateOutboundSchedule(outboundDate, outboundTime);
            }}
          />
          <BookingFormField label={t("flightNumber")} htmlFor="outbound-flight">
            <BookingInput
              id="outbound-flight"
              placeholder={t("flightNumberPlaceholder")}
              value={flight.outboundFlightNumber}
              onChange={(event) =>
                dispatch({
                  type: "UPDATE_FLIGHT",
                  flight: { outboundFlightNumber: event.target.value },
                })
              }
            />
          </BookingFormField>
          <HotelSelector />
        </div>

        <LuggageCountField />

        {search.tripType === "ROUND_TRIP" && (
          <BookingFormField
            label={t("returnFlightNumber")}
            htmlFor="return-flight"
            className="lg:max-w-sm"
          >
            <BookingInput
              id="return-flight"
              placeholder={t("flightNumberPlaceholder")}
              value={flight.returnFlightNumber}
              onChange={(event) =>
                dispatch({
                  type: "UPDATE_FLIGHT",
                  flight: { returnFlightNumber: event.target.value },
                })
              }
            />
          </BookingFormField>
        )}

        <CustomDestinationFields />

        {state.isLoadingQuote ? (
          <p className="text-sm text-muted-foreground">{t("updatingSchedule")}</p>
        ) : null}
      </div>
    </BookingFormSection>
  );
}
