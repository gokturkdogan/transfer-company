"use client";

import {
  BadgeCheck,
  CupSoda,
  Droplets,
  Luggage,
  Tv,
  Users,
  Wifi,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { VehicleImageGallery } from "@/features/booking/components/VehicleImageGallery";
import { formatPrice } from "@/features/booking/lib/format-price";
import { getVehicleImagesForName } from "@/features/booking/lib/vehicle-image";
import type { TransferVehicleOptionDto } from "@/features/pricing/types/dto";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";

type VehicleRecommendationCardProps = {
  option: TransferVehicleOptionDto;
  selected: boolean;
  disabled: boolean;
  onSelect: () => void;
};

const INCLUDED_SERVICES = [
  { key: "tv", icon: Tv },
  { key: "wifi", icon: Wifi },
  { key: "water", icon: Droplets },
  { key: "softDrinks", icon: CupSoda },
  { key: "welcomeWithName", icon: BadgeCheck },
] as const;

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
  const images = getVehicleImagesForName(option.name);
  const displayName =
    option.quantity > 1
      ? t("multiVehicle", { quantity: option.quantity, name: option.name })
      : option.name;

  return (
    <article
      className={cn(
        "overflow-hidden rounded-[1.35rem] border border-border/70 bg-card shadow-float transition-all duration-300",
        selected && "border-gold/50 ring-2 ring-gold/25 shadow-premium",
        disabled && "opacity-65",
        !disabled && "hover:border-gold/30 hover:shadow-premium",
      )}
    >
      <div className="grid gap-0 lg:grid-cols-[minmax(0,34%)_minmax(0,1fr)_11.5rem]">
        <div className="border-b border-border/60 p-4 lg:border-b-0 lg:border-e">
          <VehicleImageGallery images={images} alt={displayName} />
        </div>

        <div className="space-y-4 p-4 sm:p-5 lg:border-e lg:border-border/60">
          <div className="space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h3 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
                {displayName}
              </h3>
              <Badge variant={eligibilityVariant(option.eligibility)}>
                {t(`eligibility.${option.eligibility}`)}
              </Badge>
            </div>

            <div className="flex flex-wrap gap-2">
              <CapacityPill
                icon={Users}
                label={t("passengerRange", { max: option.passengerCapacity })}
              />
              <CapacityPill
                icon={Luggage}
                label={t("luggageMax", {
                  large: option.largeLuggageCapacity,
                  cabin: option.cabinLuggageCapacity,
                })}
              />
            </div>
          </div>

          <div className="space-y-2.5">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-gold-deep">
              {t("includedServicesTitle")}
            </p>
            <ul className="grid gap-2 sm:grid-cols-2">
              {INCLUDED_SERVICES.map(({ key, icon: Icon }) => (
                <li
                  key={key}
                  className="flex items-center gap-2 text-sm text-foreground/85"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold">
                    <Icon className="h-3.5 w-3.5" aria-hidden />
                  </span>
                  {t(`includedServices.${key}`)}
                </li>
              ))}
            </ul>
          </div>

          {option.requiredLuggageVehicles > 0 && (
            <p className="rounded-lg border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-sm text-amber-900">
              {t("luggageVehicleRequired")}
            </p>
          )}

          {option.warnings.length > 0 && (
            <ul className="space-y-1 text-sm text-muted-foreground">
              {option.warnings.map((warning) => (
                <li key={warning.code}>• {warning.message}</li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex flex-col justify-center gap-4 border-t border-border/60 bg-muted/25 p-4 sm:p-5 lg:border-t-0 lg:bg-muted/35">
          <div className="text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              {t("totalLabel")}
            </p>
            <p className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-[1.65rem]">
              {formatPrice(option.quote.totalMinor, option.quote.currency, locale)}
            </p>
          </div>

          <Button
            type="button"
            variant={selected ? "outline" : "gold"}
            size="lg"
            disabled={disabled}
            className="w-full gap-2"
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
      </div>
    </article>
  );
}

function CapacityPill({
  icon: Icon,
  label,
}: {
  icon: typeof Users;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-muted/50 px-3 py-1.5 text-xs font-semibold text-foreground/90">
      <Icon className="h-3.5 w-3.5 text-gold" aria-hidden />
      {label}
    </span>
  );
}
