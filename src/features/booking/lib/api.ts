import type {
  QuoteRequestBody,
  ReservationRequestBody,
} from "@/features/booking/lib/types";
import { fetchApi } from "@/features/booking/lib/types";
import type { HotelDto } from "@/features/locations/types";
import type {
  ReservationResponseDto,
  TransferAvailabilityResponseDto,
} from "@/features/pricing/types/dto";

export async function fetchTransferQuote(body: QuoteRequestBody) {
  return fetchApi<TransferAvailabilityResponseDto>("/api/quote", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function fetchHotelsForDistrict(districtId: string, locale: string) {
  const params = new URLSearchParams({ districtId, locale });
  return fetchApi<HotelDto[]>(`/api/locations/hotels?${params.toString()}`);
}

export async function fetchReservation(
  body: ReservationRequestBody,
  idempotencyKey: string,
) {
  return fetchApi<ReservationResponseDto>("/api/reservations", {
    method: "POST",
    headers: {
      "Idempotency-Key": idempotencyKey,
    },
    body: JSON.stringify(body),
  });
}
