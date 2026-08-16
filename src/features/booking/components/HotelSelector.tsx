"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

import { LocationCombobox } from "@/features/booking/components/LocationCombobox";
import { BookingFieldLabel } from "@/features/booking/components/BookingFieldLabel";
import { Button } from "@/components/ui/button";
import { useGlobalLoaderSync } from "@/components/shared/global-loader-provider";
import { fetchHotelsForDistrict } from "@/features/booking/lib/api";
import { CUSTOM_HOTEL_OPTION_ID } from "@/features/booking/lib/combobox-filter";
import { useBookingFlow } from "@/features/booking/context/booking-flow-context";
import { isReverseDirection } from "@/features/booking/lib/route-direction";
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
  const [loadError, setLoadError] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);

  const districtId = state.search.destinationDistrictId;
  const isLoading =
    Boolean(districtId) && loadedDistrictId !== districtId && !loadError;
  const visibleHotels =
    loadedDistrictId === districtId && !loadError ? hotels : [];

  useGlobalLoaderSync(isLoading, t("loading"));

  const retryLoad = useCallback(() => {
    setLoadError(false);
    setLoadedDistrictId(null);
    setReloadToken((token) => token + 1);
  }, []);

  useEffect(() => {
    if (!districtId) {
      return;
    }

    let cancelled = false;

    void fetchHotelsForDistrict(districtId, locale).then((result) => {
      if (cancelled) {
        return;
      }

      if (result.success) {
        setHotels(result.data);
        setLoadError(false);
        setLoadedDistrictId(districtId);
        return;
      }

      setHotels([]);
      setLoadError(true);
      setLoadedDistrictId(districtId);
    });

    return () => {
      cancelled = true;
    };
  }, [districtId, locale, reloadToken]);

  if (!districtId) {
    return null;
  }

  if (isLoading) {
    return (
      <div className={className}>
        <BookingFieldLabel
          label={
            isReverseDirection(state.search) ? t("titlePickup") : t("title")
          }
          required
        />
        <p className="flex h-10 items-center text-xs text-muted-foreground/80">
          {t("loading")}
        </p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className={className}>
        <BookingFieldLabel
          label={
            isReverseDirection(state.search) ? t("titlePickup") : t("title")
          }
          required
        />
        <div className="rounded-xl border border-border/70 bg-muted/30 px-4 py-3 text-sm">
          <p className="text-muted-foreground">{t("loadError")}</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={retryLoad}
          >
            {t("retry")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <LocationCombobox
      appearance="booking"
      className={className}
      required
      label={
        isReverseDirection(state.search) ? t("titlePickup") : t("title")
      }
      value={
        state.destination.useCustomDestination
          ? CUSTOM_HOTEL_OPTION_ID
          : state.destination.hotelLocationId
      }
      options={[
        ...visibleHotels.map((hotel) => ({ id: hotel.id, label: hotel.name })),
        { id: CUSTOM_HOTEL_OPTION_ID, label: t("notListed") },
      ]}
      alwaysVisibleOptionIds={[CUSTOM_HOTEL_OPTION_ID]}
      placeholder={t("selectHotel")}
      searchPlaceholder={t("searchHotel")}
      emptyLabel={t("empty")}
      onChange={(value) => {
        if (value === CUSTOM_HOTEL_OPTION_ID) {
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
