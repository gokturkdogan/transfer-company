import "server-only";

import { createHash } from "node:crypto";

import { buildReservationItems } from "@/features/booking/domain/build-reservation-items";
import { assertAntiSpamChecks } from "@/features/booking/domain/anti-spam";
import type { CreateReservationInputDto } from "@/features/booking/schemas/reservation";
import { toReservationResponseDto } from "@/features/booking/server/response";
import type { BookingWriter } from "@/features/booking/server/writer";
import { assertHotelInDistrict } from "@/features/locations/domain/hierarchy";
import { LocationDomainError } from "@/features/locations/domain/errors";
import type { LocationRepository } from "@/features/locations/server/repository";
import { assertRouteBookable } from "@/features/pricing/domain/guards";
import { PricingDomainError } from "@/features/pricing/domain/errors";
import type { PricingReader } from "@/features/pricing/server/reader";
import { QuoteService } from "@/features/pricing/server/quote-service";
import { generateReservationReference } from "@/lib/reference";
import {
  DomainRuleError,
  ValidationError,
} from "@/server/errors";
import { logger } from "@/server/logger";
import { buildReservationNotificationPayload } from "@/server/notifications/build-reservation-notification-payload";
import type { NotificationService } from "@/server/notifications/types";

const IDEMPOTENCY_TTL_HOURS = 24;
const MAX_REFERENCE_ATTEMPTS = 3;

function mapDomainError(error: unknown): never {
  if (error instanceof PricingDomainError || error instanceof LocationDomainError) {
    throw new DomainRuleError(error.message);
  }

  throw error;
}

function hashRequestPayload(input: CreateReservationInputDto): string {
  const payload = { ...input };
  delete payload.website;
  delete payload.formStartedAt;

  return createHash("sha256").update(JSON.stringify(payload)).digest("hex");
}

export class BookingService {
  constructor(
    private readonly repository: BookingWriter,
    private readonly quoteService: QuoteService,
    private readonly pricingRepository: PricingReader,
    private readonly locationRepository: LocationRepository,
    private readonly notificationService: NotificationService,
  ) {}

  async createReservation(
    input: CreateReservationInputDto,
    options: { idempotencyKey: string },
  ) {
    if (!options.idempotencyKey) {
      throw new ValidationError("Idempotency-Key header is required", {
        idempotencyKey: ["Idempotency-Key header is required"],
      });
    }

    try {
      assertAntiSpamChecks(input);
    } catch {
      throw new ValidationError("Request rejected");
    }

    const route = await this.pricingRepository.findRouteById(input.routeId);

    try {
      assertRouteBookable(
        route,
        input.originAirportId,
        input.destinationDistrictId,
      );
    } catch (error) {
      mapDomainError(error);
    }

    let snapshotDropoffLabel: string | undefined;

    if (input.hotelLocationId) {
      const hotel = await this.locationRepository.findById(
        input.hotelLocationId,
        input.locale,
      );

      if (!hotel) {
        throw new DomainRuleError("Hotel not found");
      }

      try {
        assertHotelInDistrict(hotel, input.destinationDistrictId);
      } catch (error) {
        mapDomainError(error);
      }

      snapshotDropoffLabel = hotel.name;
    } else if (input.customDestination) {
      snapshotDropoffLabel = input.customDestination.name;
    }

    const quoteResult = await this.quoteService.calculateTransferQuote({
      routeId: input.routeId,
      tripType: input.tripType,
      passengerCount: input.passengerCount,
      infantCount: input.infantCount,
      largeLuggageCount: input.largeLuggageCount,
      cabinLuggageCount: input.cabinLuggageCount,
      vehicles: input.vehicles,
      extras: input.extras,
      locale: input.locale,
    });

    if (quoteResult.eligibility === "INELIGIBLE") {
      throw new DomainRuleError(
        "Selected vehicle configuration is not eligible for this booking",
      );
    }

    if (
      input.clientQuotedTotalMinor !== undefined &&
      input.clientQuotedTotalMinor !== quoteResult.quote.totalMinor
    ) {
      logger.warn("Client quoted total mismatch ignored", {
        clientQuotedTotalMinor: input.clientQuotedTotalMinor,
        authoritativeTotalMinor: quoteResult.quote.totalMinor,
      });
    }

    const locationNames = await this.repository.findLocationNames(
      [input.originAirportId, input.destinationDistrictId],
      input.locale,
    );

    const airportName =
      locationNames[input.originAirportId] ?? "Unknown airport";
    const districtName =
      locationNames[input.destinationDistrictId] ?? "Unknown district";

    const isReverse = input.isReverseDirection === true;
    const pickupLocationId = isReverse
      ? (input.hotelLocationId ?? input.destinationDistrictId)
      : input.originAirportId;
    const dropoffLocationId = isReverse
      ? input.originAirportId
      : input.destinationDistrictId;
    const snapshotRouteLabel = isReverse
      ? `${districtName} → ${airportName}`
      : `${airportName} → ${districtName}`;
    const resolvedSnapshotDropoffLabel = isReverse
      ? airportName
      : snapshotDropoffLabel;

    const items = buildReservationItems(
      quoteResult.allItems,
      quoteResult.quote.currency,
    );

    const requestHash = hashRequestPayload(input);
    const idempotencyExpiresAt = new Date(
      Date.now() + IDEMPOTENCY_TTL_HOURS * 60 * 60 * 1000,
    );

    let lastError: unknown;

    for (let attempt = 0; attempt < MAX_REFERENCE_ATTEMPTS; attempt += 1) {
      try {
        const result = await this.repository.createReservationWithItems({
          idempotencyKey: options.idempotencyKey,
          requestHash,
          idempotencyExpiresAt,
          reservation: {
            reference: generateReservationReference(),
            tripType: input.tripType,
            customer: input.customer,
            pickupLocationId,
            dropoffLocationId,
            hotelLocationId: input.hotelLocationId,
            customDestinationName: input.customDestination?.name,
            customDestinationAddress: input.customDestination?.address,
            snapshotDropoffLabel: resolvedSnapshotDropoffLabel,
            routeId: input.routeId,
            outboundAt: input.outboundAt,
            returnAt: input.returnAt,
            outboundFlightNumber: input.outboundFlightNumber,
            returnFlightNumber: input.returnFlightNumber,
            passengerCount: input.passengerCount,
            largeLuggageCount: input.largeLuggageCount,
            cabinLuggageCount: input.cabinLuggageCount,
            snapshotRouteLabel,
            subtotalMinor: quoteResult.quote.subtotalMinor,
            totalMinor: quoteResult.quote.totalMinor,
            currency: quoteResult.quote.currency,
            notes: input.notes?.trim() || undefined,
            passengerDetails: input.passengers.map((passenger) => ({
              kind: passenger.kind,
              index: passenger.index,
              fullName: passenger.fullName.trim(),
              ...(passenger.idDocument?.trim()
                ? { idDocument: passenger.idDocument.trim() }
                : {}),
            })),
            items,
          },
        });

        if (!result.replayed) {
          const vehicleCategoryIds = items
            .map((item) => item.vehicleCategoryId)
            .filter((value): value is string => Boolean(value));

          const vehiclePresentations = await this.pricingRepository
            .findVehiclePresentationsByIds(vehicleCategoryIds)
            .catch(() => []);

          const notificationPayload = buildReservationNotificationPayload({
            reservationId: result.reservation.id,
            reference: result.reservation.reference,
            input,
            snapshotRouteLabel,
            snapshotDropoffLabel: resolvedSnapshotDropoffLabel,
            subtotalMinor: quoteResult.quote.subtotalMinor,
            totalMinor: result.reservation.totalMinor,
            currency: result.reservation.currency,
            items,
            vehiclePresentations,
          });

          await this.notificationService
            .sendReservationReceived(notificationPayload)
            .catch((error) => {
              logger.error("Customer notification failed", {
                reference: result.reservation.reference,
                error:
                  error instanceof Error ? error.message : "Unknown error",
              });
            });

          await this.notificationService
            .sendNewReservationToAdmin(notificationPayload)
            .catch((error) => {
              logger.error("Admin notification failed", {
                reference: result.reservation.reference,
                error:
                  error instanceof Error ? error.message : "Unknown error",
              });
            });
        }

        return toReservationResponseDto(result);
      } catch (error) {
        if (
          error instanceof Error &&
          "code" in error &&
          (error as { code?: string }).code === "23505"
        ) {
          lastError = error;
          continue;
        }

        throw error;
      }
    }

    throw lastError;
  }
}

export function createBookingService(
  repository: BookingWriter,
  quoteService: QuoteService,
  pricingRepository: PricingReader,
  locationRepository: LocationRepository,
  notificationService: NotificationService,
) {
  return new BookingService(
    repository,
    quoteService,
    pricingRepository,
    locationRepository,
    notificationService,
  );
}
