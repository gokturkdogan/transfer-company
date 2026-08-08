"use client";

import { useTranslations } from "next-intl";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { BookingReview } from "@/features/booking/components/BookingReview";
import { BookingStepper } from "@/features/booking/components/BookingStepper";
import { CustomDestinationFields } from "@/features/booking/components/CustomDestinationFields";
import { CustomerDetailsForm } from "@/features/booking/components/CustomerDetailsForm";
import { HotelSelector } from "@/features/booking/components/HotelSelector";
import { FlightDetailsForm } from "@/features/booking/components/FlightDetailsForm";
import { LuggageSelector } from "@/features/booking/components/LuggageSelector";
import { OptionalExtrasSelector } from "@/features/booking/components/OptionalExtrasSelector";
import { RequiredExtrasPanel } from "@/features/booking/components/RequiredExtrasPanel";
import { SuccessStep } from "@/features/booking/components/SuccessStep";
import { TransferSearchForm } from "@/features/booking/components/TransferSearchForm";
import { VehicleRecommendationList } from "@/features/booking/components/VehicleRecommendationList";
import { useBookingFlow } from "@/features/booking/context/booking-flow-context";

export function BookingFlow() {
  const t = useTranslations("booking");
  const { state, dispatch } = useBookingFlow();

  const selectedOption = state.quote?.options.find(
    (option) => option.vehicleCategoryId === state.selectedVehicleCategoryId,
  );

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 pb-28">
      <BookingStepper currentStep={state.step} />

      {state.errorKey && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{t(state.errorKey)}</AlertDescription>
        </Alert>
      )}

      {state.step === "search" && <TransferSearchForm />}

      {state.step === "vehicle" && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">{t("vehicle.title")}</h2>
          <LuggageSelector />
          <VehicleRecommendationList />
          <Button
            type="button"
            variant="outline"
            onClick={() => dispatch({ type: "SET_STEP", step: "search" })}
          >
            {t("actions.back")}
          </Button>
        </div>
      )}

      {state.step === "extras" && selectedOption && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">{t("extras.title")}</h2>
          <RequiredExtrasPanel
            extras={selectedOption.requiredExtras}
            currency={state.quote!.currency}
          />
          <OptionalExtrasSelector />
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => dispatch({ type: "SET_STEP", step: "vehicle" })}
            >
              {t("actions.back")}
            </Button>
            <Button
              type="button"
              onClick={() => dispatch({ type: "SET_STEP", step: "customer" })}
            >
              {t("actions.continue")}
            </Button>
          </div>
        </div>
      )}

      {state.step === "customer" && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">{t("customer.title")}</h2>
          <HotelSelector />
          <CustomDestinationFields />
          <CustomerDetailsForm />
          <FlightDetailsForm />
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => dispatch({ type: "SET_STEP", step: "extras" })}
            >
              {t("actions.back")}
            </Button>
            <Button
              type="button"
              onClick={() =>
                dispatch({
                  type: "SET_STEP",
                  step: "review",
                  idempotencyKey: crypto.randomUUID(),
                })
              }
            >
              {t("actions.continue")}
            </Button>
          </div>
        </div>
      )}

      {state.step === "review" && <BookingReview />}
      {state.step === "success" && <SuccessStep />}
    </div>
  );
}
