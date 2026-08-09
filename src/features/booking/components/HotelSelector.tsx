"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

import { LocationCombobox } from "@/features/booking/components/LocationCombobox";
import { bookingFormLabelClass } from "@/features/booking/components/booking-form-styles";
import { fetchHotelsForDistrict } from "@/features/booking/lib/api";
import { useBookingFlow } from "@/features/booking/context/booking-flow-context";
import type { HotelDto } from "@/features/locations/types";

type HotelSelectorProps = {
  className?: string;
};

export function HotelSelector({ className }: HotelSelectorProps) {
  const t = useTranslations("booking.hotel");
  const locale = useLocale();
  const { state, dispatch } = useBookingFlow();
  const [hotels, setHotels] = useState<HotelDto[]>([]);
  const [loadedDistrictId, setLoadedDistrictId] = useState<string | null>(null);

  const districtId = state.search.destinationDistrictId;
  const isLoading =
    Boolean(districtId) && loadedDistrictId !== districtId;
  const visibleHotels =
    loadedDistrictId === districtId ? hotels : [];

  useEffect(() => {
    if (!districtId) {
      return;
    }

    let cancelled = false;

    void fetchHotelsForDistrict(districtId, locale).then((result) => {
      if (cancelled) {
        return;
      }

      setHotels(result.success ? result.data : []);
      setLoadedDistrictId(districtId);
    });

    return () => {
      cancelled = true;
    };
  }, [districtId, locale]);

  if (!districtId) {
    return null;
  }

  if (isLoading) {
    return (
      <div className={className}>
        <p className={bookingFormLabelClass}>{t("title")}</p>
        <p className="flex h-10 items-center text-xs text-muted-foreground/80">
          {t("loading")}
        </p>
      </div>
    );
  }

  return (
    <LocationCombobox
      appearance="booking"
      className={className}
        label={t("title")}
        value={
          state.destination.useCustomDestination
            ? "__custom__"
            : state.destination.hotelLocationId
        }
        options={[
          ...visibleHotels.map((hotel) => ({ id: hotel.id, label: hotel.name })),
          { id: "__custom__", label: t("notListed") },
        ]}
        placeholder={t("selectHotel")}
        searchPlaceholder={t("searchHotel")}
        emptyLabel={t("empty")}
        onChange={(value) => {
          if (value === "__custom__") {
            dispatch({
              type: "SET_CUSTOM_DESTINATION",
              destination: { useCustomDestination: true },
            });
            return;
          }

          dispatch({
            type: "SET_HOTEL",
            hotelLocationId: value,
            hotelName:
              visibleHotels.find((hotel) => hotel.id === value)?.name ?? "",
          });
        }}
      />
  );
}
