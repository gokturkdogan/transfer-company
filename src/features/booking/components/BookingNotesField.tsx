"use client";

import { useTranslations } from "next-intl";

import { BookingFormField } from "@/features/booking/components/BookingFormField";
import { BookingInput } from "@/features/booking/components/BookingInput";
import { useBookingFlow } from "@/features/booking/context/booking-flow-context";

export function BookingNotesField() {
  const t = useTranslations("booking.transfer");
  const { state, dispatch } = useBookingFlow();

  return (
    <BookingFormField label={t("notes")} htmlFor="notes">
      <BookingInput
        id="notes"
        value={state.notes}
        onChange={(event) =>
          dispatch({ type: "SET_NOTES", notes: event.target.value })
        }
      />
    </BookingFormField>
  );
}
