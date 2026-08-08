"use client";

import { Car } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatPrice } from "@/features/booking/lib/format-price";
import type { TransferVehicleOptionDto } from "@/features/pricing/types/dto";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";

type VehicleRecommendationCardProps = {
  option: TransferVehicleOptionDto;
  selected: boolean;
  disabled: boolean;
  onSelect: () => void;
};

function eligibilityVariant(
  eligibility: TransferVehicleOptionDto["eligibility"],
): "success" | "warning" | "destructive" {
  if (eligibility === "ELIGIBLE") {
    return "success";
  }

  if (eligibility === "ELIGIBLE_WITH_EXTRAS") {
    return "warning";
  }

  return "destructive";
}

export function VehicleRecommendationCard({
  option,
  selected,
  disabled,
  onSelect,
}: VehicleRecommendationCardProps) {
  const t = useTranslations("booking.vehicle");
  const locale = useLocale();

  return (
    <Card
      className={cn(
        "transition-shadow",
        selected && "ring-2 ring-primary",
        disabled && "opacity-60",
      )}
    >
      <CardHeader className="flex flex-row items-start gap-4 space-y-0">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-muted">
          <Car className="h-8 w-8 text-muted-foreground" />
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle className="text-base">
              {option.quantity > 1
                ? t("multiVehicle", { quantity: option.quantity, name: option.name })
                : option.name}
            </CardTitle>
            <Badge variant={eligibilityVariant(option.eligibility)}>
              {t(`eligibility.${option.eligibility}`)}
            </Badge>
          </div>
          <CardDescription>
            {t("capacity", {
              passengers: option.passengerCapacity,
              large: option.largeLuggageCapacity,
              cabin: option.cabinLuggageCapacity,
            })}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {option.requiredLuggageVehicles > 0 && (
          <p className="text-sm text-amber-700">{t("luggageVehicleRequired")}</p>
        )}

        {option.warnings.length > 0 && (
          <ul className="space-y-1 text-sm text-muted-foreground">
            {option.warnings.map((warning) => (
              <li key={warning.code}>{warning.message}</li>
            ))}
          </ul>
        )}

        <div className="flex items-center justify-between gap-4">
          <p className="text-lg font-semibold">
            {formatPrice(option.quote.totalMinor, option.quote.currency, locale)}
          </p>
          <Button
            type="button"
            disabled={disabled}
            onClick={() => {
              track({
                name: "vehicle_selected",
                payload: { vehicleCategoryId: option.vehicleCategoryId },
              });
              onSelect();
            }}
          >
            {selected ? t("selected") : t("select")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
