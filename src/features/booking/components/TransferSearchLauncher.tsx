"use client";

import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { TransferSearchForm } from "@/features/booking/components/TransferSearchForm";
import { useBookingFlow } from "@/features/booking/context/booking-flow-context";

type TransferSearchLauncherProps = {
  showSecondaryCta?: boolean;
  variant?: "default" | "compact";
};

export function TransferSearchLauncher({
  showSecondaryCta = true,
  variant = "default",
}: TransferSearchLauncherProps) {
  const t = useTranslations("home");
  const router = useRouter();
  const { state } = useBookingFlow();
  const { search } = state;

  const navigateToBooking = () => {
    const params = new URLSearchParams({
      airport: search.originAirportId,
      city: search.cityId,
      district: search.destinationDistrictId,
      tripType: search.tripType,
      outboundDate: search.outboundDate,
      outboundTime: search.outboundTime,
      passengers: String(search.passengerCount),
      children: String(search.childCount),
      largeLuggage: String(search.largeLuggageCount),
      cabinLuggage: String(search.cabinLuggageCount),
    });

    if (search.tripType === "ROUND_TRIP") {
      params.set("returnDate", search.returnDate);
      params.set("returnTime", search.returnTime);
    }

    router.push(`/booking?${params.toString()}`);
  };

  return (
    <div className="space-y-4">
      <TransferSearchForm
        variant={variant}
        onSubmit={variant === "compact" ? navigateToBooking : undefined}
      />
      {showSecondaryCta && (
        <Button
          type="button"
          variant="outline"
          className="w-full"
          disabled={
            !search.originAirportId ||
            !search.destinationDistrictId ||
            !search.outboundDate
          }
          onClick={navigateToBooking}
        >
          {t("cta")}
        </Button>
      )}
    </div>
  );
}
