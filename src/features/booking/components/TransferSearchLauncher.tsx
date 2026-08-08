"use client";

import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

import { TransferSearchForm } from "@/features/booking/components/TransferSearchForm";
import { useBookingFlow } from "@/features/booking/context/booking-flow-context";

export function TransferSearchLauncher() {
  const t = useTranslations("home");
  const router = useRouter();
  const { state } = useBookingFlow();
  const { search } = state;

  return (
    <div className="space-y-4">
      <TransferSearchForm />
      <button
        type="button"
        className="inline-flex h-10 w-full items-center justify-center rounded-md border border-border px-4 text-sm font-medium"
        disabled={
          !search.originAirportId ||
          !search.destinationDistrictId ||
          !search.outboundDate
        }
        onClick={() => {
          const params = new URLSearchParams({
            airport: search.originAirportId,
            city: search.cityId,
            district: search.destinationDistrictId,
            tripType: search.tripType,
            outboundDate: search.outboundDate,
            outboundTime: search.outboundTime,
            passengers: String(search.passengerCount),
            largeLuggage: String(search.largeLuggageCount),
            cabinLuggage: String(search.cabinLuggageCount),
          });

          if (search.tripType === "ROUND_TRIP") {
            params.set("returnDate", search.returnDate);
            params.set("returnTime", search.returnTime);
          }

          router.push(`/booking?${params.toString()}`);
        }}
      >
        {t("cta")}
      </button>
    </div>
  );
}
