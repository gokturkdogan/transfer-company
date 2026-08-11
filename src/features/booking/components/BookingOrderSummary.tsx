"use client";

import {
  Car,
  ChevronDown,
  Clock3,
  Luggage,
  MapPin,
  PlaneLanding,
  Users,
} from "lucide-react";
import Image from "next/image";
import { ArrowRight, Loader2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { SummaryDetailRow } from "@/features/booking/components/summary/SummaryDetailRow";
import { buildOrderPricing } from "@/features/booking/lib/build-order-pricing";
import { formatPrice } from "@/features/booking/lib/format-price";
import { formatDateTimeLabel } from "@/features/booking/lib/search-datetime";
import { resolveTransferEndpointLabels } from "@/features/booking/lib/route-direction";
import { resolveVehicleCoverImage } from "@/features/vehicles/lib/resolve-vehicle-cover-image";
import { useBookingFlow } from "@/features/booking/context/booking-flow-context";
import { cn } from "@/lib/utils";

type SummaryPrimaryAction = {
  label: string;
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
};

type BookingOrderSummaryProps = {
  className?: string;
  primaryAction?: SummaryPrimaryAction;
  embedded?: boolean;
  compact?: boolean;
};

export function BookingOrderSummary({
  className,
  primaryAction,
  embedded = false,
  compact = false,
}: BookingOrderSummaryProps) {
  const t = useTranslations("booking.summary");
  const tReview = useTranslations("booking.review");
  const locale = useLocale();
  const { state, airports, districts } = useBookingFlow();
  const [extrasExpanded, setExtrasExpanded] = useState(false);

  const selectedOption = state.quote?.options.find(
    (option) => option.vehicleCategoryId === state.selectedVehicleCategoryId,
  );

  const pricing = useMemo(() => {
    if (!selectedOption || !state.quote) {
      return null;
    }

    return buildOrderPricing(
      selectedOption,
      state.quote,
      state.selectedExtras,
    );
  }, [selectedOption, state.quote, state.selectedExtras]);

  if (!selectedOption || !state.quote || !pricing) {
    return null;
  }

  const airportName =
    airports.find((airport) => airport.id === state.search.originAirportId)
      ?.name ?? "";
  const districtName =
    districts.find(
      (district) => district.id === state.search.destinationDistrictId,
    )?.name ?? "";

  const hotelOrCustomLabel = state.destination.useCustomDestination
    ? state.destination.customName
    : state.destination.hotelName;

  const endpoints = resolveTransferEndpointLabels({
    search: state.search,
    airportName,
    districtName,
    hotelOrCustomLabel: hotelOrCustomLabel || undefined,
  });

  const scheduleLabel = formatDateTimeLabel(
    state.search.outboundDate,
    state.search.outboundTime,
    locale,
  );

  const transferLabel =
    state.search.tripType === "ROUND_TRIP"
      ? t("roundTripTransfer")
      : t("oneWayTransfer");

  const vehicleImage = resolveVehicleCoverImage(
    selectedOption.imageKey,
    selectedOption.code,
  );

  const passengerParts = [
    t("adults", { count: state.search.passengerCount }),
    state.search.childCount > 0
      ? t("children", { count: state.search.childCount })
      : null,
    state.search.infantCount > 0
      ? tReview("infantsCount", { count: state.search.infantCount })
      : null,
  ].filter(Boolean);

  const luggageParts = [
    state.search.largeLuggageCount > 0
      ? tReview("largeLuggageCount", { count: state.search.largeLuggageCount })
      : null,
    state.search.cabinLuggageCount > 0
      ? tReview("cabinLuggageCount", { count: state.search.cabinLuggageCount })
      : null,
  ].filter(Boolean);

  const summaryTone = embedded ? "surface" : "ink";
  const canCollapseExtras = !embedded && pricing.hasExtras;
  const extrasTotalMinor = pricing.allExtras.reduce(
    (sum, extra) => sum + extra.totalPriceMinor,
    0,
  );
  const showExtrasList = !canCollapseExtras || extrasExpanded;

  return (
    <div
      className={cn(
        "overflow-hidden",
        embedded
          ? "rounded-none border-0 bg-transparent shadow-none"
          : cn(
              "rounded-[1.35rem] border border-white/10",
              "bg-gradient-to-br from-ink-elevated via-ink-soft to-ink",
              "shadow-[0_16px_48px_rgb(0_0_0/0.32)]",
            ),
        state.isLoadingQuote && "opacity-70 transition-opacity",
        className,
      )}
    >
      {!embedded ? (
        <div className="relative aspect-[16/10] bg-ink">
          <Image
            src={vehicleImage}
            alt={selectedOption.name}
            fill
            className="object-cover opacity-90"
            sizes="(min-width: 1024px) 22rem, 100vw"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-ink/25 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 px-4 pb-3">
            <p className="text-sm font-semibold text-white">{selectedOption.name}</p>
            <p className="text-[11px] text-white/55">{transferLabel}</p>
          </div>
        </div>
      ) : null}

      <div
        className={cn(
          embedded ? "px-0 py-0" : "border-t border-white/8 px-4 py-1",
        )}
      >
        <ul>
          {embedded ? (
            <SummaryDetailRow icon={Car} compact={compact} tone={summaryTone}>
              {selectedOption.name}
            </SummaryDetailRow>
          ) : null}
          <SummaryDetailRow
            icon={PlaneLanding}
            compact={compact}
            tone={summaryTone}
          >
            {endpoints.pickupLabel}
          </SummaryDetailRow>
          <SummaryDetailRow icon={MapPin} compact={compact} tone={summaryTone}>
            {endpoints.dropoffLabel}
          </SummaryDetailRow>
          <SummaryDetailRow icon={Users} compact={compact} tone={summaryTone}>
            {passengerParts.join(" · ")}
          </SummaryDetailRow>
          {luggageParts.length > 0 ? (
            <SummaryDetailRow icon={Luggage} compact={compact} tone={summaryTone}>
              {luggageParts.join(" · ")}
            </SummaryDetailRow>
          ) : null}
          {scheduleLabel ? (
            <SummaryDetailRow icon={Clock3} compact={compact} tone={summaryTone}>
              {scheduleLabel}
            </SummaryDetailRow>
          ) : null}
        </ul>
      </div>

      <div
        className={cn(
          "border-t",
          embedded ? "border-border/50 bg-muted/20" : "border-white/8 bg-ink/40",
          compact ? "space-y-2 px-4 py-3" : "space-y-3 px-4 py-4",
        )}
      >
        <PricingLine
          label={transferLabel}
          value={formatPrice(
            pricing.baseTransferMinor,
            pricing.currency,
            locale,
          )}
          compact={compact}
          ink={!embedded}
        />

        {pricing.hasExtras ? (
          <div className={cn(compact ? "space-y-1.5" : "space-y-2")}>
            {canCollapseExtras ? (
              <button
                type="button"
                onClick={() => setExtrasExpanded((value) => !value)}
                className="flex w-full items-start justify-between gap-3 text-left text-sm transition-colors hover:opacity-90"
                aria-expanded={extrasExpanded}
              >
                <span className="flex items-center gap-1.5 font-medium text-white/90">
                  {t("extrasToggle", { count: pricing.allExtras.length })}
                  <ChevronDown
                    className={cn(
                      "h-3.5 w-3.5 text-white/55 transition-transform duration-200",
                      extrasExpanded && "rotate-180",
                    )}
                    aria-hidden
                  />
                  <span className="text-[11px] font-normal text-white/45">
                    {extrasExpanded ? t("extrasHide") : t("extrasShow")}
                  </span>
                </span>
                <span className="shrink-0 font-semibold text-gold-light">
                  {formatPrice(extrasTotalMinor, pricing.currency, locale)}
                </span>
              </button>
            ) : null}

            {showExtrasList ? (
              <div className="space-y-2">
                {pricing.allExtras.map((extra) => (
                  <PricingLine
                    key={extra.id}
                    label={t("extraLine", {
                      name: extra.name,
                      count: extra.quantity,
                    })}
                    value={formatPrice(
                      extra.totalPriceMinor,
                      pricing.currency,
                      locale,
                    )}
                    compact={compact}
                    muted
                    ink={!embedded}
                  />
                ))}
              </div>
            ) : null}
          </div>
        ) : null}

        <div
          className={cn(
            "flex items-center justify-between gap-3 border-t pt-3",
            embedded ? "border-border/50" : "border-white/10",
          )}
        >
          <span
            className={cn(
              "font-bold",
              compact ? "text-xs" : "text-sm",
              embedded ? "text-foreground" : "text-white/90",
            )}
          >
            {tReview("total")}
          </span>
          <span
            className={cn(
              "font-bold text-gold-light",
              compact ? "text-base" : "text-lg",
            )}
          >
            {formatPrice(pricing.totalMinor, pricing.currency, locale)}
          </span>
        </div>

        {primaryAction ? (
          <Button
            type="button"
            variant="gold"
            disabled={
              primaryAction.disabled ||
              primaryAction.loading ||
              state.isLoadingQuote
            }
            className="mt-1 h-11 w-full gap-2 text-xs font-bold uppercase tracking-[0.12em]"
            onClick={primaryAction.onClick}
          >
            {primaryAction.loading ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : null}
            {primaryAction.label}
            {!primaryAction.loading ? (
              <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
            ) : null}
          </Button>
        ) : null}
      </div>
    </div>
  );
}

function PricingLine({
  label,
  value,
  compact = false,
  muted = false,
  ink = false,
}: {
  label: string;
  value: string;
  compact?: boolean;
  muted?: boolean;
  ink?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-3",
        compact ? "text-xs" : "text-sm",
      )}
    >
      <span
        className={cn(
          muted
            ? ink
              ? "text-white/55"
              : "text-muted-foreground"
            : ink
              ? "font-medium text-white/90"
              : "font-medium text-foreground",
        )}
      >
        {label}
      </span>
      <span
        className={cn(
          "shrink-0 font-semibold",
          ink ? "text-gold-light" : "text-gold-deep",
        )}
      >
        {value}
      </span>
    </div>
  );
}
