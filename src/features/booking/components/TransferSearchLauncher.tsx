"use client";

import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { TransferSearchForm } from "@/features/booking/components/TransferSearchForm";
import { HeroSearchBar } from "@/features/booking/components/hero-search/HeroSearchBar";
import { useBookingFlow } from "@/features/booking/context/booking-flow-context";
import { buildBookingSearchParams } from "@/features/booking/lib/booking-search-params";

type TransferSearchLauncherProps = {
  showSecondaryCta?: boolean;
  variant?: "default" | "compact" | "hero";
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
    const params = buildBookingSearchParams(search);
    router.push(`/booking?${params.toString()}`);
  };

  if (variant === "hero") {
    return <HeroSearchBar onSubmit={navigateToBooking} />;
  }

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
