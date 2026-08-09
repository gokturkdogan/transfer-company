"use client";

import { useEffect, type FormEvent } from "react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { CounterField } from "@/features/booking/components/CounterField";
import { LocationCombobox } from "@/features/booking/components/LocationCombobox";
import { useBookingFlow } from "@/features/booking/context/booking-flow-context";
import { cn } from "@/lib/utils";

type TransferSearchFormProps = {
  variant?: "default" | "compact";
  onSubmit?: () => void;
};

export function TransferSearchForm({
  variant = "default",
  onSubmit,
}: TransferSearchFormProps) {
  const t = useTranslations("booking.search");
  const { state, airports, cities, districts, dispatch, requestQuote } =
    useBookingFlow();
  const { search } = state;

  const cityOptions = cities.map((city) => ({
    id: city.id,
    label: city.name,
  }));

  const districtOptions = districts
    .filter((district) => !search.cityId || district.cityId === search.cityId)
    .map((district) => ({
      id: district.id,
      label: district.name,
    }));

  const showCitySelector = cityOptions.length > 1;
  const isCompact = variant === "compact";

  useEffect(() => {
    if (search.originAirportId && !search.cityId && cityOptions.length === 1) {
      dispatch({ type: "SET_CITY", cityId: cityOptions[0]!.id });
    }
  }, [cityOptions, dispatch, search.cityId, search.originAirportId]);

  const canSubmit =
    search.originAirportId &&
    search.destinationDistrictId &&
    search.outboundDate &&
    search.outboundTime &&
    (search.tripType === "ONE_WAY" ||
      (search.returnDate && search.returnTime));

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (onSubmit) {
      onSubmit();
      return;
    }

    void requestQuote();
  };

  if (isCompact) {
    return (
      <form className="space-y-3" onSubmit={handleSubmit}>
        <div className="flex flex-wrap items-end gap-3 xl:flex-nowrap">
          <TripTypeToggle
            tripType={search.tripType}
            tripTypeLabel={t("tripType")}
            oneWayLabel={t("oneWay")}
            roundTripLabel={t("roundTrip")}
            className="w-full shrink-0 sm:w-auto xl:w-[148px]"
            compact
            onChange={(tripType) => dispatch({ type: "SET_TRIP_TYPE", tripType })}
          />

          <LocationCombobox
            label={t("airport")}
            value={search.originAirportId}
            options={airports.map((airport) => ({
              id: airport.id,
              label: airport.name,
            }))}
            placeholder={t("selectAirport")}
            searchPlaceholder={t("searchAirport")}
            emptyLabel={t("noAirports")}
            className="min-w-[160px] flex-1"
            onChange={(airportId) => {
              const airport = airports.find((item) => item.id === airportId);
              dispatch({
                type: "SET_AIRPORT",
                airportId,
                cityId: airport?.cityId ?? undefined,
              });
            }}
          />

          {showCitySelector && (
            <LocationCombobox
              label={t("city")}
              value={search.cityId}
              options={cityOptions}
              placeholder={t("selectCity")}
              searchPlaceholder={t("searchCity")}
              emptyLabel={t("noCities")}
              className="min-w-[140px] flex-1"
              onChange={(cityId) => dispatch({ type: "SET_CITY", cityId })}
            />
          )}

          <LocationCombobox
            label={t("district")}
            value={search.destinationDistrictId}
            options={districtOptions}
            placeholder={t("selectDistrict")}
            searchPlaceholder={t("searchDistrict")}
            emptyLabel={t("noDistricts")}
            disabled={!search.cityId && cityOptions.length > 1}
            className="min-w-[160px] flex-1"
            onChange={(districtId) =>
              dispatch({ type: "SET_DISTRICT", districtId })
            }
          />

          <DateTimeField
            dateId="outbound-date"
            timeId="outbound-time"
            dateLabel={t("outboundDate")}
            timeLabel={t("outboundTime")}
            dateValue={search.outboundDate}
            timeValue={search.outboundTime}
            className="min-w-[220px] flex-1"
            onDateChange={(value) =>
              dispatch({
                type: "UPDATE_SEARCH",
                search: { outboundDate: value },
              })
            }
            onTimeChange={(value) =>
              dispatch({
                type: "UPDATE_SEARCH",
                search: { outboundTime: value },
              })
            }
          />

          {search.tripType === "ROUND_TRIP" && (
            <DateTimeField
              dateId="return-date"
              timeId="return-time"
              dateLabel={t("returnDate")}
              timeLabel={t("returnTime")}
              dateValue={search.returnDate}
              timeValue={search.returnTime}
              className="min-w-[220px] flex-1"
              onDateChange={(value) =>
                dispatch({
                  type: "UPDATE_SEARCH",
                  search: { returnDate: value },
                })
              }
              onTimeChange={(value) =>
                dispatch({
                  type: "UPDATE_SEARCH",
                  search: { returnTime: value },
                })
              }
            />
          )}

          <PassengerCounters
            search={search}
            adultsLabel={t("adults")}
            childrenLabel={t("children")}
            compact
            className="min-w-0 w-full shrink xl:max-w-[17rem] xl:flex-1"
            onAdultsChange={(value) =>
              dispatch({ type: "UPDATE_SEARCH", search: { passengerCount: value } })
            }
            onChildrenChange={(value) =>
              dispatch({ type: "UPDATE_SEARCH", search: { childCount: value } })
            }
          />

          <Button
            type="submit"
            variant="gold"
            size="lg"
            disabled={!canSubmit || state.isLoadingQuote}
            className="h-11 w-full shrink-0 whitespace-nowrap px-5 sm:w-auto xl:flex-none"
          >
            {state.isLoadingQuote ? t("loading") : t("submit")}
          </Button>
        </div>
      </form>
    );
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <LocationCombobox
          label={t("airport")}
          value={search.originAirportId}
          options={airports.map((airport) => ({
            id: airport.id,
            label: airport.name,
          }))}
          placeholder={t("selectAirport")}
          searchPlaceholder={t("searchAirport")}
          emptyLabel={t("noAirports")}
          onChange={(airportId) => {
            const airport = airports.find((item) => item.id === airportId);
            dispatch({
              type: "SET_AIRPORT",
              airportId,
              cityId: airport?.cityId ?? undefined,
            });
          }}
        />

        {showCitySelector && (
          <LocationCombobox
            label={t("city")}
            value={search.cityId}
            options={cityOptions}
            placeholder={t("selectCity")}
            searchPlaceholder={t("searchCity")}
            emptyLabel={t("noCities")}
            onChange={(cityId) => dispatch({ type: "SET_CITY", cityId })}
          />
        )}

        <LocationCombobox
          label={t("district")}
          value={search.destinationDistrictId}
          options={districtOptions}
          placeholder={t("selectDistrict")}
          searchPlaceholder={t("searchDistrict")}
          emptyLabel={t("noDistricts")}
          disabled={!search.cityId && cityOptions.length > 1}
          onChange={(districtId) =>
            dispatch({ type: "SET_DISTRICT", districtId })
          }
        />
      </div>

      <TripTypeToggle
        tripType={search.tripType}
        tripTypeLabel={t("tripType")}
        oneWayLabel={t("oneWay")}
        roundTripLabel={t("roundTrip")}
        onChange={(tripType) => dispatch({ type: "SET_TRIP_TYPE", tripType })}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <DateTimeField
          dateId="outbound-date"
          timeId="outbound-time"
          dateLabel={t("outboundDate")}
          timeLabel={t("outboundTime")}
          dateValue={search.outboundDate}
          timeValue={search.outboundTime}
          onDateChange={(value) =>
            dispatch({
              type: "UPDATE_SEARCH",
              search: { outboundDate: value },
            })
          }
          onTimeChange={(value) =>
            dispatch({
              type: "UPDATE_SEARCH",
              search: { outboundTime: value },
            })
          }
        />

        {search.tripType === "ROUND_TRIP" && (
          <DateTimeField
            dateId="return-date"
            timeId="return-time"
            dateLabel={t("returnDate")}
            timeLabel={t("returnTime")}
            dateValue={search.returnDate}
            timeValue={search.returnTime}
            onDateChange={(value) =>
              dispatch({
                type: "UPDATE_SEARCH",
                search: { returnDate: value },
              })
            }
            onTimeChange={(value) =>
              dispatch({
                type: "UPDATE_SEARCH",
                search: { returnTime: value },
              })
            }
          />
        )}
      </div>

      <PassengerCounters
        search={search}
        adultsLabel={t("adults")}
        childrenLabel={t("children")}
        onAdultsChange={(value) =>
          dispatch({ type: "UPDATE_SEARCH", search: { passengerCount: value } })
        }
        onChildrenChange={(value) =>
          dispatch({ type: "UPDATE_SEARCH", search: { childCount: value } })
        }
      />

      <Button
        type="submit"
        variant="gold"
        size="lg"
        disabled={!canSubmit || state.isLoadingQuote}
        className="w-full"
      >
        {state.isLoadingQuote ? t("loading") : t("submit")}
      </Button>
    </form>
  );
}

function TripTypeToggle({
  tripType,
  tripTypeLabel,
  oneWayLabel,
  roundTripLabel,
  onChange,
  className,
  compact = false,
}: {
  tripType: "ONE_WAY" | "ROUND_TRIP";
  tripTypeLabel: string;
  oneWayLabel: string;
  roundTripLabel: string;
  onChange: (tripType: "ONE_WAY" | "ROUND_TRIP") => void;
  className?: string;
  compact?: boolean;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      {!compact && <span className="text-sm font-medium">{tripTypeLabel}</span>}
      <div className={cn("grid gap-2", compact ? "grid-cols-2" : "sm:grid-cols-2")}>
        <button
          type="button"
          className={cn(
            "rounded-xl border text-sm font-medium transition-colors",
            compact ? "h-11 px-3" : "p-3.5",
            tripType === "ONE_WAY"
              ? "border-accent bg-accent/10 text-foreground"
              : "border-border hover:border-accent/40",
          )}
          onClick={() => onChange("ONE_WAY")}
        >
          {oneWayLabel}
        </button>
        <button
          type="button"
          className={cn(
            "rounded-xl border text-sm font-medium transition-colors",
            compact ? "h-11 px-3" : "p-3.5",
            tripType === "ROUND_TRIP"
              ? "border-accent bg-accent/10 text-foreground"
              : "border-border hover:border-accent/40",
          )}
          onClick={() => onChange("ROUND_TRIP")}
        >
          {roundTripLabel}
        </button>
      </div>
    </div>
  );
}

function DateTimeField({
  dateId,
  timeId,
  dateLabel,
  timeLabel,
  dateValue,
  timeValue,
  onDateChange,
  onTimeChange,
  className,
}: {
  dateId: string;
  timeId: string;
  dateLabel: string;
  timeLabel: string;
  dateValue: string;
  timeValue: string;
  onDateChange: (value: string) => void;
  onTimeChange: (value: string) => void;
  className?: string;
}) {
  return (
    <div className={cn("grid grid-cols-2 gap-2", className)}>
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor={dateId}>
          {dateLabel}
        </label>
        <input
          id={dateId}
          type="date"
          className="flex h-11 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm shadow-sm"
          value={dateValue}
          onChange={(event) => onDateChange(event.target.value)}
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor={timeId}>
          {timeLabel}
        </label>
        <input
          id={timeId}
          type="time"
          className="flex h-11 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm shadow-sm"
          value={timeValue}
          onChange={(event) => onTimeChange(event.target.value)}
        />
      </div>
    </div>
  );
}

function PassengerCounters({
  search,
  adultsLabel,
  childrenLabel,
  onAdultsChange,
  onChildrenChange,
  compact = false,
  className,
}: {
  search: ReturnType<typeof useBookingFlow>["state"]["search"];
  adultsLabel: string;
  childrenLabel: string;
  onAdultsChange: (value: number) => void;
  onChildrenChange: (value: number) => void;
  compact?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-2 sm:grid-cols-2", className)}>
      <CounterField
        label={adultsLabel}
        value={search.passengerCount}
        min={1}
        max={50}
        compact={compact}
        onChange={onAdultsChange}
      />
      <CounterField
        label={childrenLabel}
        value={search.childCount}
        max={50}
        compact={compact}
        onChange={onChildrenChange}
      />
    </div>
  );
}
