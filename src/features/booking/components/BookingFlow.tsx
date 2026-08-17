"use client";

import dynamic from "next/dynamic";

import { BookingErrorNotifier } from "@/features/booking/components/BookingErrorNotifier";
import { BookingFlowShell } from "@/features/booking/components/BookingFlowShell";
import { BookingSearchPrompt } from "@/features/booking/components/BookingSearchPrompt";
import { BookingSidebar } from "@/features/booking/components/BookingSidebar";
import { BookingStepCard } from "@/features/booking/components/BookingStepCard";
import { BookingFormSections } from "@/features/booking/components/BookingFormSections";
import { AcceptedPaymentCurrenciesNotice } from "@/features/booking/components/AcceptedPaymentCurrenciesNotice";
import { BookingNotesField } from "@/features/booking/components/BookingNotesField";
import { CustomerDetailsForm } from "@/features/booking/components/CustomerDetailsForm";
import { ExtrasSection } from "@/features/booking/components/ExtrasSection";
import { PassengerDetailsForm } from "@/features/booking/components/PassengerDetailsForm";
import { TransferDetailsForm } from "@/features/booking/components/TransferDetailsForm";
import { useBookingFlow } from "@/features/booking/context/booking-flow-context";
import { resolveActiveVehicleContext } from "@/features/booking/lib/vehicle-selection-context";

const BookingReview = dynamic(() =>
  import("@/features/booking/components/BookingReview").then((module) => ({
    default: module.BookingReview,
  })),
);

const SuccessStep = dynamic(() =>
  import("@/features/booking/components/SuccessStep").then((module) => ({
    default: module.SuccessStep,
  })),
);

const VehicleRecommendationList = dynamic(() =>
  import("@/features/booking/components/VehicleRecommendationList").then(
    (module) => ({
      default: module.VehicleRecommendationList,
    }),
  ),
);

export function BookingFlow() {
  const { state } = useBookingFlow();

  const { selectedOptions } = resolveActiveVehicleContext(
    state.quote,
    state.selectedVehicles,
  );
  const selectedOption = selectedOptions[0];

  const showStepCard =
    state.step !== "vehicle" &&
    state.step !== "search" &&
    state.step !== "success";
  const showMobileSummaryBelow = state.step === "review";

  return (
    <BookingFlowShell>
      <BookingErrorNotifier />

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
