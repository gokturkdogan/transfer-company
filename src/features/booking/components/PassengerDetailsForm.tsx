"use client";

import { Users } from "lucide-react";
import { useTranslations } from "next-intl";

import { BookingFormField } from "@/features/booking/components/BookingFormField";
import { BookingFormSection } from "@/features/booking/components/BookingFormSection";
import { BookingInput } from "@/features/booking/components/BookingInput";
import { useBookingFlow } from "@/features/booking/context/booking-flow-context";
import { passengerSlotKey, resolvePassengerKindLabel } from "@/features/booking/lib/passenger-details";

export function PassengerDetailsForm() {
  const t = useTranslations("booking.passengers");
  const { state, dispatch } = useBookingFlow();

  if (state.passengers.length === 0) {
    return null;
  }

  return (
    <BookingFormSection
      title={t("title")}
      description={t("subtitle")}
      icon={<Users className="h-4 w-4" aria-hidden />}
    >
      <div className="space-y-5">
        {state.passengers.map((passenger) => {
          const label = resolvePassengerKindLabel(passenger, {
            adult: (index) => t("adultLabel", { index }),
            child: (index) => t("childLabel", { index }),
            infant: (index) => t("infantLabel", { index }),
          });

          return (
            <div
              key={passengerSlotKey(passenger)}
              className="space-y-3 border-b border-border/30 pb-5 last:border-b-0 last:pb-0"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                {label}
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <BookingFormField
                  label={t("fullName")}
                  htmlFor={`passenger-name-${passengerSlotKey(passenger)}`}
                  required
                >
                  <BookingInput
                    id={`passenger-name-${passengerSlotKey(passenger)}`}
                    autoComplete="name"
                    required
                    value={passenger.fullName}
                    onChange={(event) =>
                      dispatch({
                        type: "UPDATE_PASSENGER",
                        kind: passenger.kind,
                        index: passenger.index,
                        passenger: { fullName: event.target.value },
                      })
                    }
                  />
                </BookingFormField>
                <BookingFormField
                  label={t("idDocument")}
                  htmlFor={`passenger-id-${passengerSlotKey(passenger)}`}
                >
                  <BookingInput
                    id={`passenger-id-${passengerSlotKey(passenger)}`}
                    placeholder={t("idDocumentPlaceholder")}
                    value={passenger.idDocument}
                    onChange={(event) =>
                      dispatch({
                        type: "UPDATE_PASSENGER",
                        kind: passenger.kind,
                        index: passenger.index,
                        passenger: { idDocument: event.target.value },
                      })
                    }
                  />
                </BookingFormField>
              </div>
            </div>
          );
        })}
      </div>
    </BookingFormSection>
  );
}
