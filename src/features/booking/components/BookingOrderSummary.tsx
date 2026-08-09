"use client";

import {
  Baby,
  Car,
  Clock3,
  MapPin,
  PlaneLanding,
  Users,
} from "lucide-react";
import Image from "next/image";
import { ArrowRight, Loader2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
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

  const selectedOption = state.quote?.options.find(
    (option) => option.vehicleCategoryId === state.selectedVehicleCategoryId,
  );

  const pricing = useMemo(() => {
    if (!selectedOption || !state.quote) {
      return null;
    }

    const currency = state.quote.currency;
    const baseTransferMinor = selectedOption.quote.baseItems.reduce(
      (sum, item) => sum + item.totalPriceMinor,
      0,
    );

    const requiredExtras = selectedOption.requiredExtras.map((extra) => ({
      id: extra.extraServiceId,
      name: extra.name,
      quantity: extra.quantity,
      totalPriceMinor: extra.totalPriceMinor,
    }));

    const optionalExtras = state.selectedExtras
      .map((selected) => {
        const extra = selectedOption.optionalExtras.find(
          (item) => item.extraServiceId === selected.extraServiceId,
        );

        if (!extra || selected.quantity <= 0) {
          return null;
        }

        return {
          id: extra.extraServiceId,
          name: extra.name,
          quantity: selected.quantity,
          totalPriceMinor: extra.unitPriceMinor * selected.quantity,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

    const totalMinor =
      state.quote.selection?.quote.totalMinor ?? selectedOption.quote.totalMinor;

    return {
      currency,
      baseTransferMinor,
      requiredExtras,
      optionalExtras,
      totalMinor,
      hasExtras: requiredExtras.length > 0 || optionalExtras.length > 0,
    };
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

  return (
    <div
      className={cn(
        "overflow-hidden bg-card",
        embedded
          ? "rounded-none border-0 shadow-none"
          : "rounded-[1.35rem] border border-border/60 shadow-float",
        state.isLoadingQuote && "opacity-70 transition-opacity",
        className,
      )}
    >
      <div className="relative aspect-video bg-muted/20">
        <Image
          src={vehicleImage}
          alt={selectedOption.name}
          fill
          className="object-cover"
          sizes="(min-width: 1024px) 22rem, 100vw"
        />
      </div>

      <div
        className={cn(
          "border-t border-border/50 bg-card",
          compact ? "px-4 py-0.5" : "px-4 py-1 sm:px-5",
        )}
      >
        <ul>
          <SummaryDetailRow icon={Car} compact={compact}>
            {selectedOption.name}
          </SummaryDetailRow>
          <SummaryDetailRow icon={PlaneLanding} compact={compact}>
            {endpoints.pickupLabel}
          </SummaryDetailRow>
          <SummaryDetailRow icon={MapPin} compact={compact}>
            {endpoints.dropoffLabel}
          </SummaryDetailRow>
          {compact ? (
            <SummaryDetailRow icon={Users} compact>
              {t("passengers", {
                adults: state.search.passengerCount,
                children: state.search.childCount,
              })}
            </SummaryDetailRow>
          ) : (
            <>
              <SummaryDetailRow icon={Users}>
                {t("adults", { count: state.search.passengerCount })}
              </SummaryDetailRow>
              <SummaryDetailRow icon={Baby}>
                {t("children", { count: state.search.childCount })}
              </SummaryDetailRow>
            </>
          )}
          {scheduleLabel ? (
            <SummaryDetailRow icon={Clock3} compact={compact}>
              {scheduleLabel}
            </SummaryDetailRow>
          ) : null}
        </ul>
      </div>

      <div
        className={cn(
          "border-t border-border/50 bg-muted/35",
          compact ? "space-y-2 px-4 py-3" : "space-y-3 px-4 py-4 sm:px-5",
        )}
      >
        <div
          className={cn(
            "flex items-start justify-between gap-3",
            compact ? "text-xs" : "text-sm",
          )}
        >
          <span className="font-medium text-foreground">{transferLabel}</span>
          <span className="shrink-0 font-semibold text-gold-deep">
            {formatPrice(pricing.baseTransferMinor, pricing.currency, locale)}
          </span>
        </div>

        {pricing.hasExtras ? (
          <div className={cn(compact ? "space-y-1.5" : "space-y-2")}>
            <p
              className={cn(
                "font-semibold text-foreground",
                compact ? "text-xs" : "text-sm",
              )}
            >
              {t("extrasTitle")}
            </p>
            {[...pricing.requiredExtras, ...pricing.optionalExtras].map(
              (extra) => (
                <div
                  key={extra.id}
                  className={cn(
                    "flex items-start justify-between gap-3",
                    compact ? "text-xs" : "text-sm",
                  )}
                >
                  <span className="text-muted-foreground">
                    {t("extraLine", {
                      name: extra.name,
                      count: extra.quantity,
                    })}
                  </span>
                  <span className="shrink-0 font-medium text-gold-deep">
                    {formatPrice(
                      extra.totalPriceMinor,
                      pricing.currency,
                      locale,
                    )}
                  </span>
                </div>
              ),
            )}
          </div>
        ) : null}

        <div
          className={cn(
            "flex items-center justify-between gap-3 border-t border-border/50",
            compact ? "pt-2" : "pt-3",
          )}
        >
          <span
            className={cn(
              "font-bold text-foreground",
              compact ? "text-xs" : "text-sm",
            )}
          >
            {tReview("total")}
          </span>
          <span
            className={cn(
              "font-bold text-gold-deep",
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

function SummaryDetailRow({
  icon: Icon,
  children,
  compact = false,
}: {
  icon: typeof Car;
  children: ReactNode;
  compact?: boolean;
}) {
  return (
    <li
      className={cn(
        "flex items-center border-b border-border/40 last:border-b-0",
        compact ? "gap-2.5 py-1.5" : "gap-3 py-3",
      )}
    >
      <span
        className={cn(
          "flex shrink-0 items-center justify-center rounded-lg bg-gold/14 text-gold-deep",
          compact ? "h-7 w-7" : "h-8 w-8",
        )}
      >
        <Icon className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} aria-hidden />
      </span>
      <span
        className={cn(
          "min-w-0 flex-1 truncate font-medium leading-snug text-foreground",
          compact ? "text-xs" : "text-sm",
        )}
      >
        {children}
      </span>
    </li>
  );
}
