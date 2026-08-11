import { buildSearchSignature } from "@/features/booking/lib/search-signature";
import type { BookingFlowAction } from "@/features/booking/lib/booking-flow-reducer";
import type { BookingFlowState } from "@/features/booking/lib/types";
import type {
  AirportDto,
  CityDto,
  DistrictDto,
} from "@/features/locations/types";
import type { TransferAvailabilityResponseDto } from "@/features/pricing/types/dto";

export const BOOKING_DEV_REVIEW_STORAGE_KEY = "tc-booking-dev-review-snapshot";

const MOCK_VEHICLE_ID = "a1000001-0001-4001-8001-000000000001";
const MOCK_CHILD_SEAT_ID = "a2000002-0002-4002-8002-000000000002";
const MOCK_MEET_GREET_ID = "a3000003-0003-4003-8003-000000000003";

export type DevReviewSnapshot = Extract<
  BookingFlowAction,
  { type: "RESTORE_SEARCH_DRAFT" }
>["snapshot"] & {
  step: "review";
  customer: BookingFlowState["customer"];
  flight: BookingFlowState["flight"];
  notes: string;
  idempotencyKey: string;
};

function buildMockQuote(): TransferAvailabilityResponseDto {
  return {
    routeId: "b1000001-0001-4001-8001-0000000000r1",
    currency: "EUR",
    timeZone: "Europe/Istanbul",
    options: [
      {
        vehicleCategoryId: MOCK_VEHICLE_ID,
        name: "Mercedes Vito VIP",
        code: "VITO_ULTRA",
        imageKey: null,
        galleryImageKeys: [],
        quantity: 1,
        passengerCapacity: 8,
        largeLuggageCapacity: 8,
        cabinLuggageCapacity: 2,
        eligibility: "ELIGIBLE_WITH_EXTRAS",
        requiredLuggageVehicles: 0,
        requiredChildSeats: 1,
        warnings: [],
        requiredExtras: [
          {
            extraServiceId: MOCK_CHILD_SEAT_ID,
            name: "Çocuk koltuğu",
            pricingMode: "PER_UNIT",
            quantity: 1,
            maxQuantity: 3,
            includedQuantity: 1,
            unitPriceMinor: 500,
            totalPriceMinor: 0,
            required: true,
          },
        ],
        optionalExtras: [
          {
            extraServiceId: MOCK_MEET_GREET_ID,
            name: "Karşılama tabelası",
            pricingMode: "PER_UNIT",
            quantity: 0,
            maxQuantity: 1,
            includedQuantity: 0,
            unitPriceMinor: 1500,
            totalPriceMinor: 0,
            required: false,
          },
        ],
        features: ["Wi-Fi", "Su", "TV"],
        quote: {
          currency: "EUR",
          baseItems: [
            {
              type: "TRANSFER_VEHICLE",
              referenceId: MOCK_VEHICLE_ID,
              name: "Mercedes Vito VIP",
              quantity: 1,
              unitPriceMinor: 8500,
              totalPriceMinor: 8500,
            },
          ],
          extraItems: [
            {
              type: "EXTRA_SERVICE",
              referenceId: MOCK_MEET_GREET_ID,
              name: "Karşılama tabelası",
              quantity: 1,
              unitPriceMinor: 1500,
              totalPriceMinor: 1500,
            },
          ],
          subtotalMinor: 10000,
          totalMinor: 10000,
        },
      },
    ],
    selection: {
      vehicleCategoryId: MOCK_VEHICLE_ID,
      quantity: 1,
      eligibility: "ELIGIBLE_WITH_EXTRAS",
      requiredExtras: [
        {
          extraServiceId: MOCK_CHILD_SEAT_ID,
          name: "Çocuk koltuğu",
          pricingMode: "PER_UNIT",
          quantity: 1,
          maxQuantity: 3,
          includedQuantity: 1,
          unitPriceMinor: 500,
          totalPriceMinor: 0,
          required: true,
        },
      ],
      quote: {
        currency: "EUR",
        baseItems: [
          {
            type: "TRANSFER_VEHICLE",
            referenceId: MOCK_VEHICLE_ID,
            name: "Mercedes Vito VIP",
            quantity: 1,
            unitPriceMinor: 8500,
            totalPriceMinor: 8500,
          },
        ],
        extraItems: [
          {
            type: "EXTRA_SERVICE",
            referenceId: MOCK_MEET_GREET_ID,
            name: "Karşılama tabelası",
            quantity: 1,
            unitPriceMinor: 1500,
            totalPriceMinor: 1500,
          },
        ],
        subtotalMinor: 10000,
        totalMinor: 10000,
      },
      allItems: [],
    },
  };
}

export function buildDevReviewSnapshot({
  airports,
  cities,
  districts,
}: {
  airports: AirportDto[];
  cities: CityDto[];
  districts: DistrictDto[];
}): DevReviewSnapshot {
  const airport = airports[0];
  const district =
    districts.find((item) => item.cityId === (airport?.cityId ?? cities[0]?.id)) ??
    districts[0];
  const cityId = airport?.cityId ?? district?.cityId ?? cities[0]?.id ?? "";

  const search = {
    originAirportId: airport?.id ?? "",
    cityId,
    destinationDistrictId: district?.id ?? "",
    isReverseDirection: false,
    tripType: "ONE_WAY" as const,
    outboundDate: "2026-08-22",
    outboundTime: "14:30",
    returnDate: "",
    returnTime: "10:00",
    passengerCount: 2,
    childCount: 1,
    infantCount: 1,
    largeLuggageCount: 3,
    cabinLuggageCount: 1,
  };

  const quote = buildMockQuote();

  return {
    step: "review",
    search,
    destination: {
      hotelLocationId: "hotel-mock-belek",
      hotelName: "Regnum Carya Golf Resort",
      useCustomDestination: false,
      customName: "",
      customAddress: "",
    },
    quote,
    searchSignature: buildSearchSignature(search),
    selectedVehicleCategoryId: MOCK_VEHICLE_ID,
    selectedQuantity: 1,
    selectedExtras: [
      {
        extraServiceId: MOCK_MEET_GREET_ID,
        quantity: 1,
      },
    ],
    passengers: [
      {
        kind: "adult",
        index: 1,
        fullName: "Ahmet Yılmaz",
        idDocument: "",
      },
      {
        kind: "adult",
        index: 2,
        fullName: "Ayşe Yılmaz",
        idDocument: "U12345678",
      },
      {
        kind: "child",
        index: 1,
        fullName: "Can Yılmaz",
        idDocument: "",
      },
    ],
    customer: {
      firstName: "Ahmet",
      lastName: "Yılmaz",
      email: "ahmet@example.com",
      phoneCountryCode: "TR",
      phone: "5321112233",
      secondaryPhoneCountryCode: "TR",
      secondaryPhone: "5329998877",
    },
    flight: {
      outboundFlightNumber: "TK2428",
      returnFlightNumber: "",
    },
    notes: "Otel lobisinde karşılanmak istiyoruz. Bebek koltuğu gerekli.",
    idempotencyKey: "dev-review-mock-key",
  };
}

export function createDevReviewSnapshotFromState(
  state: BookingFlowState,
): DevReviewSnapshot | null {
  if (state.step !== "review" || !state.quote || !state.selectedVehicleCategoryId) {
    return null;
  }

  return {
    step: "review",
    search: { ...state.search },
    destination: { ...state.destination },
    quote: state.quote,
    searchSignature: state.searchSignature,
    selectedVehicleCategoryId: state.selectedVehicleCategoryId,
    selectedQuantity: state.selectedQuantity,
    selectedExtras: state.selectedExtras.map((extra) => ({ ...extra })),
    passengers: state.passengers.map((passenger) => ({ ...passenger })),
    customer: { ...state.customer },
    flight: { ...state.flight },
    notes: state.notes,
    idempotencyKey: state.idempotencyKey ?? crypto.randomUUID(),
  };
}

export function readDevReviewSnapshot(): DevReviewSnapshot | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.sessionStorage.getItem(BOOKING_DEV_REVIEW_STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as DevReviewSnapshot;
  } catch {
    return null;
  }
}

export function writeDevReviewSnapshot(snapshot: DevReviewSnapshot): void {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(
    BOOKING_DEV_REVIEW_STORAGE_KEY,
    JSON.stringify(snapshot),
  );
}

export function clearDevReviewSnapshot(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.removeItem(BOOKING_DEV_REVIEW_STORAGE_KEY);
}

export function isDevReviewMockEnabled(): boolean {
  return process.env.NODE_ENV === "development";
}

export function shouldActivateDevReviewMock(): boolean {
  if (!isDevReviewMockEnabled() || typeof window === "undefined") {
    return false;
  }

  const params = new URLSearchParams(window.location.search);

  return params.get("mock") === "review" || readDevReviewSnapshot() !== null;
}
