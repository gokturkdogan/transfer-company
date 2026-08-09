"use client";

import { useTranslations } from "next-intl";

import { BookingFormField } from "@/features/booking/components/BookingFormField";
import { BookingInput } from "@/features/booking/components/BookingInput";
import { useBookingFlow } from "@/features/booking/context/booking-flow-context";

export function CustomDestinationFields() {
  const t = useTranslations("booking.hotel");
  const { state, dispatch } = useBookingFlow();

  if (!state.destination.useCustomDestination) {
    return null;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <BookingFormField
        label={t("customName")}
        htmlFor="custom-name"
        className="sm:col-span-2"
      >
        <BookingInput
          id="custom-name"
          value={state.destination.customName}
          onChange={(event) =>
            dispatch({
              type: "SET_CUSTOM_DESTINATION",
              destination: { customName: event.target.value },
            })
          }
        />
      </BookingFormField>
      <BookingFormField
        label={t("customAddress")}
        htmlFor="custom-address"
        className="sm:col-span-2"
      >
        <BookingInput
          id="custom-address"
          value={state.destination.customAddress}
          onChange={(event) =>
            dispatch({
              type: "SET_CUSTOM_DESTINATION",
              destination: { customAddress: event.target.value },
            })
          }
        />
      </BookingFormField>
    </div>
  );
}
