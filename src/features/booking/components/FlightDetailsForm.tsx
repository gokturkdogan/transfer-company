"use client";

import { useTranslations } from "next-intl";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useBookingFlow } from "@/features/booking/context/booking-flow-context";

export function FlightDetailsForm() {
  const t = useTranslations("booking.flight");
  const { state, dispatch } = useBookingFlow();
  const { flight, search } = state;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="outbound-flight">{t("outbound")}</Label>
        <Input
          id="outbound-flight"
          value={flight.outboundFlightNumber}
          onChange={(event) =>
            dispatch({
              type: "UPDATE_FLIGHT",
              flight: { outboundFlightNumber: event.target.value },
            })
          }
        />
      </div>

      {search.tripType === "ROUND_TRIP" && (
        <div className="space-y-2">
          <Label htmlFor="return-flight">{t("return")}</Label>
          <Input
            id="return-flight"
            value={flight.returnFlightNumber}
            onChange={(event) =>
              dispatch({
                type: "UPDATE_FLIGHT",
                flight: { returnFlightNumber: event.target.value },
              })
            }
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="notes">{t("notes")}</Label>
        <Input
          id="notes"
          value={state.notes}
          onChange={(event) =>
            dispatch({ type: "SET_NOTES", notes: event.target.value })
          }
        />
      </div>
    </div>
  );
}
