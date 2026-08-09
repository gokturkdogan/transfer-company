import type { BookingSearchState } from "@/features/booking/lib/types";

export function isReverseDirection(search: BookingSearchState): boolean {
  return search.isReverseDirection;
}

export function buildSearchRouteLabel({
  airportName,
  districtName,
  isReverseDirection: reverse = false,
}: {
  airportName: string;
  districtName: string;
  isReverseDirection?: boolean;
}): string {
  const origin = reverse ? districtName || "—" : airportName || "—";
  const destination = reverse ? airportName || "—" : districtName || "—";

  return `${origin} → ${destination}`;
}

type TransferEndpointLabels = {
  pickupLabel: string;
  dropoffLabel: string;
  displayOrigin: string;
  displayDestination: string;
};

export function resolveTransferEndpointLabels({
  search,
  airportName,
  districtName,
  hotelOrCustomLabel,
}: {
  search: BookingSearchState;
  airportName: string;
  districtName: string;
  hotelOrCustomLabel?: string;
}): TransferEndpointLabels {
  const detailLabel = hotelOrCustomLabel || districtName;

  if (isReverseDirection(search)) {
    return {
      pickupLabel: detailLabel,
      dropoffLabel: airportName,
      displayOrigin: districtName,
      displayDestination: airportName,
    };
  }

  return {
    pickupLabel: airportName,
    dropoffLabel: detailLabel,
    displayOrigin: airportName,
    displayDestination: districtName,
  };
}
