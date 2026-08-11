"use client";

import { ArrowRight, Loader2, MapPin, PlaneLanding } from "lucide-react";
import { useEffect, useMemo, type FormEvent } from "react";
import { useTranslations } from "next-intl";

import { DateTimeSegment } from "@/features/booking/components/hero-search/DateTimeSegment";
import { LocationSegment } from "@/features/booking/components/hero-search/LocationSegment";
import { PassengerSegment } from "@/features/booking/components/hero-search/PassengerSegment";
import { RouteSwapButton } from "@/features/booking/components/RouteSwapButton";
import { useBookingFlow } from "@/features/booking/context/booking-flow-context";
import { todayIsoDateInProjectZone } from "@/features/booking/lib/search-datetime";
import { cn } from "@/lib/utils";

type HeroSearchBarProps = {
  onSubmit: () => void;
  variant?: "hero" | "embedded";
};

/**
 * The hero conversion surface: every field lives on a single row from `lg` up,
 * collapsing to a two-column card on tablets and a stack on phones.
 *
 * Passenger counters are collapsed behind one popover segment — that is what
 * keeps the row to a single line even for round trips.
 */
export function HeroSearchBar({
  onSubmit,
  variant = "hero",
}: HeroSearchBarProps) {
  const isEmbedded = variant === "embedded";
  const t = useTranslations("booking.search");
  const { state, airports, cities, districts, dispatch } = useBookingFlow();
  const { search } = state;

  const minDate = useMemo(() => todayIsoDateInProjectZone(), []);
  const isRoundTrip = search.tripType === "ROUND_TRIP";
  const isReverse = search.isReverseDirection;

  const airportOptions = useMemo(
    () => airports.map((airport) => ({ id: airport.id, label: airport.name })),
    [airports],
  );

  const cityNameById = useMemo(
    () => new Map(cities.map((city) => [city.id, city.name])),
    [cities],
  );

  // Multiple cities are expressed as popover groups instead of an extra
  // segment, so the row never grows past one line.
  const districtOptions = useMemo(
    () =>
      districts.map((district) => ({
        id: district.id,
        label: district.name,
        group:
          cities.length > 1 ? cityNameById.get(district.cityId) : undefined,
      })),
    [cities.length, cityNameById, districts],
  );

  useEffect(() => {
    if (search.originAirportId && !search.cityId && cities.length === 1) {
      dispatch({ type: "SET_CITY", cityId: cities[0]!.id });
    }
  }, [cities, dispatch, search.cityId, search.originAirportId]);

  const canSubmit = Boolean(
    search.originAirportId &&
      search.destinationDistrictId &&
      search.outboundDate &&
      search.outboundTime &&
      (!isRoundTrip || (search.returnDate && search.returnTime)),
  );

  const airportSegment = (
    <LocationSegment
      icon={PlaneLanding}
      label={t("airport")}
      value={search.originAirportId}
      options={airportOptions}
      placeholder={t("selectAirport")}
      searchPlaceholder={t("searchAirport")}
      emptyLabel={t("noAirports")}
      embedded={isEmbedded}
      withDivider={!isEmbedded}
      className="min-w-0 w-full lg:flex-1 lg:basis-0"
      onChange={(airportId) => {
        const airport = airports.find((item) => item.id === airportId);
        dispatch({
          type: "SET_AIRPORT",
          airportId,
          cityId: airport?.cityId ?? undefined,
        });
      }}
    />
  );

  const districtSegment = (
    <LocationSegment
      icon={MapPin}
      label={t("district")}
      value={search.destinationDistrictId}
      options={districtOptions}
      placeholder={t("selectDistrict")}
      searchPlaceholder={t("searchDistrict")}
      emptyLabel={t("noDistricts")}
      embedded={isEmbedded}
      withDivider={!isEmbedded}
      className="min-w-0 w-full lg:flex-1 lg:basis-0"
      onChange={(districtId) => {
        const district = districts.find((item) => item.id === districtId);
        dispatch({
          type: "UPDATE_SEARCH",
          search: {
            destinationDistrictId: districtId,
            cityId: district?.cityId ?? search.cityId,
          },
        });
      }}
    />
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (canSubmit) {
      onSubmit();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="min-w-0 max-lg:space-y-0 lg:space-y-3">
      <TripTypeToggle
        tripType={search.tripType}
        oneWayLabel={t("oneWay")}
        roundTripLabel={t("roundTrip")}
        variant={variant}
        className="hidden lg:inline-flex"
        onChange={(tripType) => dispatch({ type: "SET_TRIP_TYPE", tripType })}
      />

      <div
        className={cn(
          isEmbedded ? "space-y-4" : "rounded-[24px] border border-white/30 bg-white/14 p-2 shadow-[0_12px_48px_rgb(0_0_0/0.38)] backdrop-blur-2xl max-lg:ring-1 max-lg:ring-gold/30 lg:rounded-[28px] lg:border-white/25 lg:bg-white/12 lg:p-1.5 lg:shadow-premium lg:ring-0",
        )}
      >
        <TripTypeToggle
          tripType={search.tripType}
          oneWayLabel={t("oneWay")}
          roundTripLabel={t("roundTrip")}
          variant={variant}
          className={cn(
            "w-full justify-center lg:hidden",
            isEmbedded ? "mb-0" : "mb-2",
          )}
          onChange={(tripType) => dispatch({ type: "SET_TRIP_TYPE", tripType })}
        />

        <div
          className={cn(
            isEmbedded
              ? "grid grid-cols-1 gap-0 divide-y divide-border/25 sm:grid-cols-2 sm:gap-x-3 sm:divide-y-0"
              : "grid grid-cols-1 gap-2 rounded-[18px] bg-card/98 p-2 max-lg:gap-2 sm:grid-cols-2 sm:max-lg:gap-1.5 lg:flex lg:flex-nowrap lg:items-center lg:gap-0 lg:rounded-[22px] lg:bg-card/95 lg:p-1.5",
          )}
        >
          {isReverse ? districtSegment : airportSegment}

          <div
            className={cn(
              "flex items-center justify-center",
              isEmbedded
                ? "py-1 sm:col-span-2"
                : "max-lg:py-0.5 lg:flex-none lg:px-0.5",
            )}
          >
            <RouteSwapButton
              onClick={() => dispatch({ type: "SWAP_ROUTE_DIRECTION" })}
            />
          </div>

          {isReverse ? airportSegment : districtSegment}

          <DateTimeSegment
            label={t("outboundDate")}
            dateValue={search.outboundDate}
            timeValue={search.outboundTime}
            minDate={minDate}
            embedded={isEmbedded}
            className="min-w-0 w-full lg:flex-1 lg:basis-0"
            onDateChange={(value) =>
              dispatch({ type: "UPDATE_SEARCH", search: { outboundDate: value } })
            }
            onTimeChange={(value) =>
              dispatch({ type: "UPDATE_SEARCH", search: { outboundTime: value } })
            }
          />

          {isRoundTrip && (
            <DateTimeSegment
              label={t("returnDate")}
              dateValue={search.returnDate}
              timeValue={search.returnTime}
              minDate={search.outboundDate || minDate}
              embedded={isEmbedded}
              className="min-w-0 w-full lg:flex-1 lg:basis-0"
              onDateChange={(value) =>
                dispatch({ type: "UPDATE_SEARCH", search: { returnDate: value } })
              }
              onTimeChange={(value) =>
                dispatch({ type: "UPDATE_SEARCH", search: { returnTime: value } })
              }
            />
          )}

          <PassengerSegment
            adults={search.passengerCount}
            childCount={search.childCount}
            infantCount={search.infantCount}
            withDivider={false}
            embedded={isEmbedded}
            className="min-w-0 w-full lg:flex-[0.85_1_0%] lg:basis-0"
            onAdultsChange={(value) =>
              dispatch({ type: "UPDATE_SEARCH", search: { passengerCount: value } })
            }
            onChildrenChange={(value) =>
              dispatch({ type: "UPDATE_SEARCH", search: { childCount: value } })
            }
            onInfantsChange={(value) =>
              dispatch({ type: "UPDATE_SEARCH", search: { infantCount: value } })
            }
          />

          <button
            type="submit"
            disabled={!canSubmit || state.isLoadingQuote}
            className={cn(
              "group relative flex h-14 w-full cursor-pointer items-center justify-center",
              "rounded-xl bg-gold-gradient text-base font-bold tracking-tight text-ink",
              "shadow-gold transition-all duration-300 hover:brightness-110 active:scale-[0.98]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2",
              "disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none",
              isEmbedded
                ? "col-span-1 mt-4 h-12 rounded-2xl sm:col-span-2"
                : "max-lg:mt-1 sm:col-span-2",
              "lg:col-auto lg:mt-0 lg:h-[52px] lg:w-auto lg:flex-none lg:shrink-0 lg:whitespace-nowrap lg:rounded-2xl lg:px-4 lg:text-sm",
            )}
          >
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]"
            >
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/45 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            </span>
            <span className="relative z-[1] inline-flex items-center gap-2">
              {state.isLoadingQuote ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  {t("loading")}
                </>
              ) : (
                <>
                  {t("submit")}
                  <ArrowRight
                    className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover:translate-x-0.5 rtl:rotate-180"
                    aria-hidden
                  />
                </>
              )}
            </span>
          </button>
        </div>
      </div>
    </form>
  );
}

function TripTypeToggle({
  tripType,
  oneWayLabel,
  roundTripLabel,
  variant = "hero",
  className,
  onChange,
}: {
  tripType: "ONE_WAY" | "ROUND_TRIP";
  oneWayLabel: string;
  roundTripLabel: string;
  variant?: "hero" | "embedded";
  className?: string;
  onChange: (tripType: "ONE_WAY" | "ROUND_TRIP") => void;
}) {
  const isEmbedded = variant === "embedded";
  const options = [
    { value: "ONE_WAY" as const, label: oneWayLabel },
    { value: "ROUND_TRIP" as const, label: roundTripLabel },
  ];

  return (
    <div
      role="radiogroup"
      className={cn(
        "inline-flex items-center gap-1 rounded-full p-1",
        isEmbedded
          ? "border border-border/60 bg-muted/40"
          : "border border-white/20 bg-white/10 backdrop-blur-xl",
        "max-lg:w-full max-lg:justify-center",
        className,
      )}
    >
      {options.map((option) => {
        const active = tripType === option.value;

        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "cursor-pointer rounded-full px-4 py-2 text-xs font-semibold tracking-wide transition-all duration-300 max-lg:flex-1 max-lg:py-2.5",
              active
                ? "bg-gold-gradient text-ink shadow-gold"
                : isEmbedded
                  ? "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                  : "text-white/75 hover:bg-white/10 hover:text-white",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
