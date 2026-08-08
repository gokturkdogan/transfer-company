"use client";

import { ArrowRight, Loader2, MapPin, PlaneLanding } from "lucide-react";
import { useEffect, useMemo, type FormEvent } from "react";
import { useTranslations } from "next-intl";

import { DateTimeSegment } from "@/features/booking/components/hero-search/DateTimeSegment";
import { LocationSegment } from "@/features/booking/components/hero-search/LocationSegment";
import { PassengerSegment } from "@/features/booking/components/hero-search/PassengerSegment";
import { useBookingFlow } from "@/features/booking/context/booking-flow-context";
import { cn } from "@/lib/utils";

type HeroSearchBarProps = {
  onSubmit: () => void;
};

function todayIsoDate() {
  const now = new Date();
  const offsetMs = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offsetMs).toISOString().slice(0, 10);
}

/**
 * The hero conversion surface: every field lives on a single row from `lg` up,
 * collapsing to a two-column card on tablets and a stack on phones.
 *
 * Passenger and luggage counters are collapsed behind one popover segment —
 * that is what keeps the row to a single line even for round trips.
 */
export function HeroSearchBar({ onSubmit }: HeroSearchBarProps) {
  const t = useTranslations("booking.search");
  const { state, airports, cities, districts, dispatch } = useBookingFlow();
  const { search } = state;

  const minDate = useMemo(() => todayIsoDate(), []);
  const isRoundTrip = search.tripType === "ROUND_TRIP";

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

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (canSubmit) {
      onSubmit();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-lg:space-y-0 lg:space-y-3">
      <TripTypeToggle
        tripType={search.tripType}
        oneWayLabel={t("oneWay")}
        roundTripLabel={t("roundTrip")}
        className="hidden lg:inline-flex"
        onChange={(tripType) => dispatch({ type: "SET_TRIP_TYPE", tripType })}
      />

      <div className="rounded-[20px] border border-white/30 bg-white/14 p-1 shadow-[0_12px_48px_rgb(0_0_0/0.38)] backdrop-blur-2xl max-lg:ring-1 max-lg:ring-gold/25 lg:rounded-[28px] lg:border-white/25 lg:bg-white/12 lg:p-1.5 lg:shadow-premium lg:ring-0">
        <TripTypeToggle
          tripType={search.tripType}
          oneWayLabel={t("oneWay")}
          roundTripLabel={t("roundTrip")}
          className="mb-1.5 w-fit justify-start lg:hidden"
          onChange={(tripType) => dispatch({ type: "SET_TRIP_TYPE", tripType })}
        />

        <div className="grid grid-cols-1 gap-0.5 rounded-[16px] bg-card/98 p-1 max-lg:divide-y max-lg:divide-border/40 sm:grid-cols-2 sm:max-lg:divide-y-0 sm:max-lg:gap-1 lg:flex lg:items-center lg:gap-0 lg:rounded-[22px] lg:bg-card/95 lg:p-1.5">
          <LocationSegment
            icon={PlaneLanding}
            label={t("airport")}
            value={search.originAirportId}
            options={airportOptions}
            placeholder={t("selectAirport")}
            searchPlaceholder={t("searchAirport")}
            emptyLabel={t("noAirports")}
            className="lg:flex-[1.15_1_0%]"
            onChange={(airportId) => {
              const airport = airports.find((item) => item.id === airportId);
              dispatch({
                type: "SET_AIRPORT",
                airportId,
                cityId: airport?.cityId ?? undefined,
              });
            }}
          />

          <LocationSegment
            icon={MapPin}
            label={t("district")}
            value={search.destinationDistrictId}
            options={districtOptions}
            placeholder={t("selectDistrict")}
            searchPlaceholder={t("searchDistrict")}
            emptyLabel={t("noDistricts")}
            className="lg:flex-[1.15_1_0%]"
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

          <DateTimeSegment
            label={t("outboundDate")}
            dateLabel={t("outboundDate")}
            timeLabel={t("outboundTime")}
            dateValue={search.outboundDate}
            timeValue={search.outboundTime}
            minDate={minDate}
            className="lg:flex-[1_1_0%]"
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
              dateLabel={t("returnDate")}
              timeLabel={t("returnTime")}
              dateValue={search.returnDate}
              timeValue={search.returnTime}
              minDate={search.outboundDate || minDate}
              className="lg:flex-[1_1_0%]"
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
            largeLuggage={search.largeLuggageCount}
            cabinLuggage={search.cabinLuggageCount}
            withDivider={false}
            className="lg:flex-[0.9_1_0%]"
            onAdultsChange={(value) =>
              dispatch({ type: "UPDATE_SEARCH", search: { passengerCount: value } })
            }
            onChildrenChange={(value) =>
              dispatch({ type: "UPDATE_SEARCH", search: { childCount: value } })
            }
            onLargeLuggageChange={(value) =>
              dispatch({
                type: "UPDATE_SEARCH",
                search: { largeLuggageCount: value },
              })
            }
            onCabinLuggageChange={(value) =>
              dispatch({
                type: "UPDATE_SEARCH",
                search: { cabinLuggageCount: value },
              })
            }
          />

          <button
            type="submit"
            disabled={!canSubmit || state.isLoadingQuote}
            className={cn(
              "group relative flex h-[3.25rem] w-full shrink-0 cursor-pointer items-center justify-center gap-2",
              "overflow-hidden rounded-xl bg-gold-gradient px-6 text-sm font-bold tracking-tight text-ink",
              "shadow-gold transition-all duration-300 hover:brightness-110 active:scale-[0.98]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2",
              "disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none",
              "max-lg:mt-0.5 sm:col-span-2 lg:col-span-1 lg:h-[52px] lg:w-auto lg:rounded-2xl",
            )}
          >
            <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/45 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            {state.isLoadingQuote ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                {t("loading")}
              </>
            ) : (
              <>
                {t("submit")}
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 rtl:rotate-180"
                  aria-hidden
                />
              </>
            )}
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
  className,
  onChange,
}: {
  tripType: "ONE_WAY" | "ROUND_TRIP";
  oneWayLabel: string;
  roundTripLabel: string;
  className?: string;
  onChange: (tripType: "ONE_WAY" | "ROUND_TRIP") => void;
}) {
  const options = [
    { value: "ONE_WAY" as const, label: oneWayLabel },
    { value: "ROUND_TRIP" as const, label: roundTripLabel },
  ];

  return (
    <div
      role="radiogroup"
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/10 p-1 backdrop-blur-xl",
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
              "cursor-pointer rounded-full px-4 py-1.5 text-xs font-semibold tracking-wide transition-all duration-300",
              active
                ? "bg-gold-gradient text-ink shadow-gold"
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
