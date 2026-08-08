"use client";

import { useTranslations } from "next-intl";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useBookingFlow } from "@/features/booking/context/booking-flow-context";

export function CustomDestinationFields() {
  const t = useTranslations("booking.hotel");
  const { state, dispatch } = useBookingFlow();

  if (!state.destination.useCustomDestination) {
    return null;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor="custom-name">{t("customName")}</Label>
        <Input
          id="custom-name"
          value={state.destination.customName}
          onChange={(event) =>
            dispatch({
              type: "SET_CUSTOM_DESTINATION",
              destination: { customName: event.target.value },
            })
          }
        />
      </div>
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor="custom-address">{t("customAddress")}</Label>
        <Input
          id="custom-address"
          value={state.destination.customAddress}
          onChange={(event) =>
            dispatch({
              type: "SET_CUSTOM_DESTINATION",
              destination: { customAddress: event.target.value },
            })
          }
        />
      </div>
    </div>
  );
}
