"use client";

import { useTranslations } from "next-intl";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { BookingFlowNavigation } from "@/features/booking/components/BookingFlowNavigation";
import { BookingFlowShell } from "@/features/booking/components/BookingFlowShell";
import { BookingReview } from "@/features/booking/components/BookingReview";
import { BookingStepCard } from "@/features/booking/components/BookingStepCard";
import { BookingStepHeader } from "@/features/booking/components/BookingStepHeader";
import { CustomDestinationFields } from "@/features/booking/components/CustomDestinationFields";
import { CustomerDetailsForm } from "@/features/booking/components/CustomerDetailsForm";
import { FlightDetailsForm } from "@/features/booking/components/FlightDetailsForm";
import { HotelSelector } from "@/features/booking/components/HotelSelector";
import { LuggageSelector } from "@/features/booking/components/LuggageSelector";
import { OptionalExtrasSelector } from "@/features/booking/components/OptionalExtrasSelector";
import { RequiredExtrasPanel } from "@/features/booking/components/RequiredExtrasPanel";
import { SuccessStep } from "@/features/booking/components/SuccessStep";
import { VehicleRecommendationList } from "@/features/booking/components/VehicleRecommendationList";
import { useBookingFlow } from "@/features/booking/context/booking-flow-context";

export function BookingFlow() {
  const t = useTranslations("booking");
  const { state, dispatch } = useBookingFlow();

  const selectedOption = state.quote?.options.find(
    (option) => option.vehicleCategoryId === state.selectedVehicleCategoryId,
  );

  return (
    <BookingFlowShell>
      <BookingStepCard>
        {state.errorKey && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{t(state.errorKey)}</AlertDescription>
          </Alert>
        )}

        {state.step === "search" && (
          <BookingStepHeader
            eyebrow={t("page.searchEyebrow")}
            title={t("page.searchTitle")}
            subtitle={t("page.searchSubtitle")}
          />
        )}

        {state.step === "vehicle" && (
          <>
            <BookingStepHeader
              eyebrow={t("page.vehicleEyebrow")}
              title={t("vehicle.title")}
              subtitle={t("page.vehicleSubtitle")}
            />
            <div className="space-y-6">
              <LuggageSelector />
              <VehicleRecommendationList />
            </div>
          </>
        )}

        {state.step === "customer" && selectedOption && (
          <>
            <BookingStepHeader
              eyebrow={t("page.detailsEyebrow")}
              title={t("page.detailsTitle")}
              subtitle={t("page.detailsSubtitle")}
            />
            <div className="space-y-6">
              <RequiredExtrasPanel
                extras={selectedOption.requiredExtras}
                currency={state.quote!.currency}
              />
              <OptionalExtrasSelector />
              <HotelSelector />
              <CustomDestinationFields />
              <CustomerDetailsForm />
              <FlightDetailsForm />
            </div>
            <BookingFlowNavigation
              className="mt-8"
              onBack={() => dispatch({ type: "SET_STEP", step: "vehicle" })}
              onContinue={() =>
                dispatch({
                  type: "SET_STEP",
                  step: "review",
                  idempotencyKey: crypto.randomUUID(),
                })
              }
            />
          </>
        )}

        {state.step === "review" && <BookingReview />}
        {state.step === "success" && <SuccessStep />}
      </BookingStepCard>
    </BookingFlowShell>
  );
}
