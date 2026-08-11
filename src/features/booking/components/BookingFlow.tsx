"use client";

import { useTranslations } from "next-intl";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { BookingFlowShell } from "@/features/booking/components/BookingFlowShell";
import { BookingSearchPrompt } from "@/features/booking/components/BookingSearchPrompt";
import { BookingReview } from "@/features/booking/components/BookingReview";
import { BookingSidebar } from "@/features/booking/components/BookingSidebar";
import { BookingStepCard } from "@/features/booking/components/BookingStepCard";
import { BookingFormSections } from "@/features/booking/components/BookingFormSections";
import { AcceptedPaymentCurrenciesNotice } from "@/features/booking/components/AcceptedPaymentCurrenciesNotice";
import { BookingNotesField } from "@/features/booking/components/BookingNotesField";
import { CustomerDetailsForm } from "@/features/booking/components/CustomerDetailsForm";
import { ExtrasSection } from "@/features/booking/components/ExtrasSection";
import { PassengerDetailsForm } from "@/features/booking/components/PassengerDetailsForm";
import { TransferDetailsForm } from "@/features/booking/components/TransferDetailsForm";
import { SuccessStep } from "@/features/booking/components/SuccessStep";
import { VehicleRecommendationList } from "@/features/booking/components/VehicleRecommendationList";
import { useBookingFlow } from "@/features/booking/context/booking-flow-context";

export function BookingFlow() {
  const t = useTranslations("booking");
  const { state } = useBookingFlow();

  const selectedOption = state.quote?.options.find(
    (option) => option.vehicleCategoryId === state.selectedVehicleCategoryId,
  );

  const showStepCard =
    state.step !== "vehicle" &&
    state.step !== "search" &&
    state.step !== "success";
  const showMobileSummaryBelow = state.step === "review";

  return (
    <BookingFlowShell>
      {state.errorKey && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{t(state.errorKey)}</AlertDescription>
        </Alert>
      )}

      {state.step === "search" && <BookingSearchPrompt />}

      {state.step === "vehicle" && <VehicleRecommendationList />}

      {showStepCard && (
        <BookingStepCard>
          {state.step === "customer" && selectedOption && (
            <BookingFormSections>
              <CustomerDetailsForm />
              <TransferDetailsForm />
              <PassengerDetailsForm />
              <ExtrasSection />
              <BookingNotesField />
              <AcceptedPaymentCurrenciesNotice />
            </BookingFormSections>
          )}

          {state.step === "review" && <BookingReview />}
        </BookingStepCard>
      )}

      {state.step === "success" && <SuccessStep />}

      {showMobileSummaryBelow ? (
        <div className="mt-8 lg:hidden">
          <BookingSidebar />
        </div>
      ) : null}
    </BookingFlowShell>
  );
}
