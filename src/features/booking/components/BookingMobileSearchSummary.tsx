"use client";

import { ChevronRight, Search } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRef, useState } from "react";

import { BookingSearchEditSheet } from "@/features/booking/components/BookingSearchEditSheet";
import { HeroSearchBar } from "@/features/booking/components/hero-search/HeroSearchBar";
import {
  buildSearchMetaLabel,
  buildSearchRouteLabel,
} from "@/features/booking/lib/build-search-summary";
import { useBookingFlow } from "@/features/booking/context/booking-flow-context";
import type { BookingFlowAction } from "@/features/booking/lib/booking-flow-reducer";
import type { BookingFlowState } from "@/features/booking/lib/types";
import { cn } from "@/lib/utils";

type SearchEditSnapshot = Extract<
  BookingFlowAction,
  { type: "RESTORE_SEARCH_DRAFT" }
>["snapshot"];

type BookingMobileSearchSummaryProps = {
  onSubmit: () => void;
};

function createSearchEditSnapshot(
  state: BookingFlowState,
): SearchEditSnapshot {
  return {
    search: { ...state.search },
    destination: { ...state.destination },
    quote: state.quote,
    searchSignature: state.searchSignature,
    selectedVehicleCategoryId: state.selectedVehicleCategoryId,
    selectedQuantity: state.selectedQuantity,
    selectedExtras: state.selectedExtras.map((extra) => ({ ...extra })),
    passengers: state.passengers.map((passenger) => ({ ...passenger })),
  };
}

export function BookingMobileSearchSummary({
  onSubmit,
}: BookingMobileSearchSummaryProps) {
  const t = useTranslations("booking.search");
  const locale = useLocale();
  const { state, dispatch, airports, districts } = useBookingFlow();
  const [open, setOpen] = useState(false);
  const draftSnapshotRef = useRef<SearchEditSnapshot | null>(null);
  const submittedRef = useRef(false);

  const airportName =
    airports.find((airport) => airport.id === state.search.originAirportId)
      ?.name ?? "";
  const districtName =
    districts.find(
      (district) => district.id === state.search.destinationDistrictId,
    )?.name ?? "";

  const routeLabel = buildSearchRouteLabel({
    airportName,
    districtName,
    isReverseDirection: state.search.isReverseDirection,
  });
  const metaLabel = buildSearchMetaLabel({
    search: state.search,
    airportName,
    districtName,
    locale,
    formatPassengers: (adults, children) => {
      const parts = [t("adultsShort", { count: adults })];

      if (children > 0) {
        parts.push(t("childrenShort", { count: children }));
      }

      return parts.join(" · ");
    },
  });

  const handleOpen = () => {
    draftSnapshotRef.current = createSearchEditSnapshot(state);
    submittedRef.current = false;
    setOpen(true);
  };

  const handleClose = () => {
    if (!submittedRef.current && draftSnapshotRef.current) {
      dispatch({
        type: "RESTORE_SEARCH_DRAFT",
        snapshot: draftSnapshotRef.current,
      });
    }

    setOpen(false);
  };

  const handleSubmit = () => {
    submittedRef.current = true;
    onSubmit();
    setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className={cn(
          "relative flex w-full cursor-pointer items-center gap-3 overflow-hidden rounded-[1.25rem]",
          "border border-white/10 bg-gradient-to-br from-ink-elevated via-ink-soft to-ink p-3",
          "text-start shadow-premium ring-gold-hairline",
          "transition-[border-color,box-shadow,transform] duration-300",
          "hover:border-gold/30 hover:shadow-[0_28px_70px_-24px_rgb(200_164_93/0.28)]",
          "active:scale-[0.99]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/45",
        )}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(90%_120%_at_0%_0%,rgb(200_164_93/0.14),transparent_58%)]"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute -end-6 -top-8 h-24 w-24 rounded-full bg-gold/15 blur-2xl"
        />

        <span className="relative z-[1] flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/8 text-gold">
          <Search className="h-4 w-4" aria-hidden />
        </span>
        <span className="relative z-[1] min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold tracking-tight text-white">
            {routeLabel}
          </span>
          <span className="mt-0.5 block truncate text-xs text-white/58">
            {metaLabel}
          </span>
        </span>
        <span className="relative z-[1] flex shrink-0 items-center gap-0.5 text-xs font-semibold text-gold-light">
          {t("mobileEditSearch")}
          <ChevronRight className="h-3.5 w-3.5 rtl:rotate-180" aria-hidden />
        </span>
      </button>

      <BookingSearchEditSheet open={open} onClose={handleClose}>
        {open ? (
          <HeroSearchBar onSubmit={handleSubmit} variant="embedded" />
        ) : null}
      </BookingSearchEditSheet>
    </>
  );
}
