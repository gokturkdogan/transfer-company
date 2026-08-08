"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";

import { CounterField } from "@/features/booking/components/CounterField";
import { LocationCombobox } from "@/features/booking/components/LocationCombobox";
import { useBookingFlow } from "@/features/booking/context/booking-flow-context";

export function TransferSearchForm() {
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

  return (
    <form
      className="space-y-6"
      onSubmit={(event) => {
        event.preventDefault();
        void requestQuote();
      }}
    >
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

      <div className="space-y-2">
        <label className="text-sm font-medium">{t("tripType")}</label>
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            className={`rounded-lg border p-3 text-sm font-medium ${
              search.tripType === "ONE_WAY"
                ? "border-primary bg-primary/5"
                : "border-border"
            }`}
            onClick={() => dispatch({ type: "SET_TRIP_TYPE", tripType: "ONE_WAY" })}
          >
            {t("oneWay")}
          </button>
          <button
            type="button"
            className={`rounded-lg border p-3 text-sm font-medium ${
              search.tripType === "ROUND_TRIP"
                ? "border-primary bg-primary/5"
                : "border-border"
            }`}
            onClick={() =>
              dispatch({ type: "SET_TRIP_TYPE", tripType: "ROUND_TRIP" })
            }
          >
            {t("roundTrip")}
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="outbound-date">
            {t("outboundDate")}
          </label>
          <input
            id="outbound-date"
            type="date"
            className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            value={search.outboundDate}
            onChange={(event) =>
              dispatch({
                type: "UPDATE_SEARCH",
                search: { outboundDate: event.target.value },
              })
            }
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="outbound-time">
            {t("outboundTime")}
          </label>
          <input
            id="outbound-time"
            type="time"
            className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            value={search.outboundTime}
            onChange={(event) =>
              dispatch({
                type: "UPDATE_SEARCH",
                search: { outboundTime: event.target.value },
              })
            }
          />
        </div>
      </div>

      {search.tripType === "ROUND_TRIP" && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="return-date">
              {t("returnDate")}
            </label>
            <input
              id="return-date"
              type="date"
              className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              value={search.returnDate}
              onChange={(event) =>
                dispatch({
                  type: "UPDATE_SEARCH",
                  search: { returnDate: event.target.value },
                })
              }
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="return-time">
              {t("returnTime")}
            </label>
            <input
              id="return-time"
              type="time"
              className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              value={search.returnTime}
              onChange={(event) =>
                dispatch({
                  type: "UPDATE_SEARCH",
                  search: { returnTime: event.target.value },
                })
              }
            />
          </div>
        </div>
      )}

      <div className="grid gap-3">
        <CounterFields search={search} dispatch={dispatch} t={t} />
      </div>

      <button
        type="submit"
        disabled={!canSubmit || state.isLoadingQuote}
        className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-50"
      >
        {state.isLoadingQuote ? t("loading") : t("submit")}
      </button>
    </form>
  );
}

function CounterFields({
  search,
  dispatch,
  t,
}: {
  search: ReturnType<typeof useBookingFlow>["state"]["search"];
  dispatch: ReturnType<typeof useBookingFlow>["dispatch"];
  t: ReturnType<typeof useTranslations>;
}) {
  return (
    <>
      <CounterField
        label={t("passengers")}
        value={search.passengerCount}
        min={1}
        max={50}
        onChange={(value: number) =>
          dispatch({ type: "UPDATE_SEARCH", search: { passengerCount: value } })
        }
      />
      <CounterField
        label={t("largeLuggage")}
        value={search.largeLuggageCount}
        onChange={(value: number) =>
          dispatch({
            type: "UPDATE_SEARCH",
            search: { largeLuggageCount: value },
          })
        }
      />
      <CounterField
        label={t("cabinLuggage")}
        value={search.cabinLuggageCount}
        onChange={(value: number) =>
          dispatch({
            type: "UPDATE_SEARCH",
            search: { cabinLuggageCount: value },
          })
        }
      />
    </>
  );
}
