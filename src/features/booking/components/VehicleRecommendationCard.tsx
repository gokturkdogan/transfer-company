"use client";

import {
  BadgeCheck,
  Check,
  Droplets,
  Luggage,
  Minus,
  Plus,
  Sparkles,
  Tv,
  Users,
  Wifi,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useMemo } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { VehicleImageGallery } from "@/features/booking/components/VehicleImageGallery";
import { formatPrice } from "@/features/booking/lib/format-price";
import {
  MAX_VEHICLE_BOOKING_PREVIEW_IMAGES,
  MAX_VEHICLE_FEATURES,
} from "@/features/vehicles/domain/constants";
import { resolveVehicleCoverImage } from "@/features/vehicles/lib/resolve-vehicle-cover-image";
import type { TransferVehicleOptionDto } from "@/features/pricing/types/dto";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";

type VehicleRecommendationCardProps = {
  option: TransferVehicleOptionDto;
  multiSelectMode: boolean;
  selectedQuantity: number;
  selected: boolean;
  disabled: boolean;
  onSelect: () => void;
  onToggle: () => void;
  onAdjustQuantity: (delta: number) => void;
};

const INCLUDED_SERVICES = [
  { key: "tv", icon: Tv },
  { key: "wifi", icon: Wifi },
  { key: "water", icon: Droplets },
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
  multiSelectMode,
  selectedQuantity,
  selected,
  disabled,
  onSelect,
  onToggle,
  onAdjustQuantity,
}: VehicleRecommendationCardProps) {
  const t = useTranslations("booking.vehicle");
  const locale = useLocale();
  const coverImage = resolveVehicleCoverImage(option.imageKey, option.code);
  const previewImages = useMemo(
    () =>
      option.galleryImageKeys
        .map((image) => image.trim())
        .filter((image) => image.length > 0)
        .slice(0, MAX_VEHICLE_BOOKING_PREVIEW_IMAGES),
    [option.galleryImageKeys],
  );
  const displayName =
    selectedQuantity > 1
      ? t("multiVehicle", { quantity: selectedQuantity, name: option.name })
      : option.name;
  const vehicleFeatures = option.features.slice(0, MAX_VEHICLE_FEATURES);

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
          <VehicleImageGallery
            key={`${option.vehicleCategoryId}-${coverImage}-${previewImages.join("|")}`}
            coverImage={coverImage}
            previewImages={previewImages}
            alt={displayName}
          />
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
                })}
              />
            </div>
          </div>

          <div
            className={cn(
              "grid gap-6",
              vehicleFeatures.length > 0 ? "sm:grid-cols-2" : "grid-cols-1",
            )}
          >
            <div className="space-y-2.5">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-gold-deep">
                {t("includedServicesTitle")}
              </p>
              <ul className="flex flex-col gap-2">
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

            {vehicleFeatures.length > 0 && (
              <div className="space-y-2.5">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-gold-deep">
                  {t("vehicleFeaturesTitle")}
                </p>
                <ul className="flex flex-col gap-2">
                  {vehicleFeatures.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-2 text-sm text-foreground/85"
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-gold">
                        <Sparkles className="h-3.5 w-3.5" aria-hidden />
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {option.requiredLuggageVehicle ? (
            <p className="rounded-lg border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-sm text-amber-900">
              {t("luggageVehicleRequired")}
            </p>
          ) : null}

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
              {formatPrice(
                option.quote.totalMinor * (multiSelectMode ? selectedQuantity || 1 : 1),
                option.quote.currency,
                locale,
              )}
            </p>
          </div>

          {multiSelectMode ? (
            <div className="flex flex-col items-center gap-3">
              <button
                type="button"
                aria-pressed={selected}
                disabled={disabled}
                className={cn(
                  "flex h-11 w-11 items-center justify-center rounded-full border-2 transition-colors",
                  selected
                    ? "border-gold bg-gold text-white"
                    : "border-border bg-card text-muted-foreground hover:border-gold/40",
                  disabled && "opacity-50",
                )}
                onClick={() => {
                  track({
                    name: "vehicle_selected",
                    payload: { vehicleCategoryId: option.vehicleCategoryId },
                  });
                  onToggle();
                }}
              >
                <Check className="h-5 w-5" aria-hidden />
                <span className="sr-only">{selected ? t("selected") : t("select")}</span>
              </button>

              {selectedQuantity > 0 ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card"
                    aria-label={t("decreaseQuantity")}
                    onClick={() => onAdjustQuantity(-1)}
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="min-w-8 text-center text-sm font-semibold">
                    {selectedQuantity}
                  </span>
                  <button
                    type="button"
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card"
                    aria-label={t("increaseQuantity")}
                    onClick={() => onAdjustQuantity(1)}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
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
          )}
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
