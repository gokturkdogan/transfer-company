import "server-only";

import { recommendVehicles } from "@/features/capacity/domain/recommend-vehicles";
import { resolveCapacityPassengerCount } from "@/features/capacity/domain/capacity-passenger-count";
import { selectCheapestLuggageFleetVehicle } from "@/features/capacity/domain/select-cheapest-luggage-fleet-vehicle";
import { calculateExtraTotalMinor } from "@/features/pricing/domain/extra-pricing";
import {
  resolveIncludedQuantityForRequiredChildSeats,
  resolveRequiredChildSeatQuantity,
} from "@/features/pricing/domain/required-child-seats";
import { mapVehicleOptionsToLuggageFleetCandidates } from "@/features/pricing/domain/luggage-fleet-vehicle";
import { calculateQuote } from "@/features/pricing/domain/calculate-quote";
import { PricingDomainError } from "@/features/pricing/domain/errors";
import { assertRouteActive } from "@/features/pricing/domain/guards";
import type { TransferAvailabilityInputDto } from "@/features/pricing/schemas/availability";
import type { PricingReader } from "@/features/pricing/server/reader";
import type { QuoteService } from "@/features/pricing/server/quote-service";
import type {
  PricedSelectionDto,
  TransferAvailabilityResponseDto,
  TransferOptionExtraDto,
  TransferVehicleOptionDto,
} from "@/features/pricing/types/dto";
import { assertPriceableEndpoints } from "@/features/locations/domain/hierarchy";
import { LocationDomainError } from "@/features/locations/domain/errors";
import type { LocationRepository } from "@/features/locations/server/repository";
import { DEFAULT_CURRENCY, PROJECT_TIME_ZONE } from "@/config/constants";
import type { VehicleFeatureRepository } from "@/features/vehicles/server/feature-repository";
import type { VehicleGalleryRepository } from "@/features/vehicles/server/gallery-repository";
import { DomainRuleError } from "@/server/errors";

function mapDomainError(error: unknown): never {
  if (error instanceof PricingDomainError || error instanceof LocationDomainError) {
    throw new DomainRuleError(error.message);
  }

  throw error;
}

function buildRequiredExtras(
  childSeatExtra: Awaited<
    ReturnType<PricingReader["findChildSeatExtra"]>
  > | null,
  infantCount: number,
  extrasById: Map<
    string,
    Awaited<ReturnType<PricingReader["findCustomerSelectableExtras"]>>[number]
  >,
): { extras: TransferOptionExtraDto[]; requiredChildSeats: number } {
  const requiredExtras: TransferOptionExtraDto[] = [];

  const requiredChildSeats = resolveRequiredChildSeatQuantity(
    infantCount,
    childSeatExtra,
  );

  if (requiredChildSeats > 0 && childSeatExtra) {
    const extra = extrasById.get(childSeatExtra.id) ?? childSeatExtra;
    const includedQuantity = resolveIncludedQuantityForRequiredChildSeats(
      requiredChildSeats,
      extra.includedQuantity,
    );

    requiredExtras.push({
      extraServiceId: extra.id,
      name: extra.translatedName ?? extra.code,
      pricingMode: extra.pricingMode,
      quantity: requiredChildSeats,
      maxQuantity: extra.maxQuantity,
      includedQuantity,
      unitPriceMinor: extra.priceMinor,
      totalPriceMinor: calculateExtraTotalMinor({
        pricingMode: extra.pricingMode,
        quantity: requiredChildSeats,
        unitPriceMinor: extra.priceMinor,
        includedQuantity,
      }),
      required: true,
    });
  }

  return { extras: requiredExtras, requiredChildSeats };
}

function buildOptionalExtras(
  extras: Awaited<ReturnType<PricingReader["findCustomerSelectableExtras"]>>,
  requiredExtraIds: Set<string>,
): TransferOptionExtraDto[] {
  return extras
    .filter((extra) => !requiredExtraIds.has(extra.id))
    .map((extra) => ({
      extraServiceId: extra.id,
      name: extra.translatedName ?? extra.code,
      pricingMode: extra.pricingMode,
      quantity: extra.minQuantity,
      maxQuantity: extra.maxQuantity,
      includedQuantity: extra.includedQuantity,
      unitPriceMinor: extra.priceMinor,
      totalPriceMinor: calculateExtraTotalMinor({
        pricingMode: extra.pricingMode,
        quantity: extra.minQuantity,
        unitPriceMinor: extra.priceMinor,
        includedQuantity: extra.includedQuantity,
      }),
      required: false,
    }));
}

export class AvailabilityService {
  constructor(
    private readonly repository: PricingReader,
    private readonly quoteService?: QuoteService,
    private readonly locationRepository?: LocationRepository,
    private readonly featureRepository?: VehicleFeatureRepository,
    private readonly galleryRepository?: VehicleGalleryRepository,
  ) {}

  async getTransferOptions(
    input: TransferAvailabilityInputDto,
  ): Promise<TransferAvailabilityResponseDto> {
    try {
      if (this.locationRepository) {
        const [origin, destination] = await Promise.all([
          this.locationRepository.findById(input.originAirportId, input.locale),
          this.locationRepository.findById(
            input.destinationDistrictId,
            input.locale,
          ),
        ]);

        if (!origin || !destination) {
          throw new LocationDomainError("Location not found");
        }

        assertPriceableEndpoints(origin, destination);
      }

      const route = await this.repository.findActiveRouteByAirportAndDistrict(
        input.originAirportId,
        input.destinationDistrictId,
      );

      assertRouteActive(route);

      const quoteCurrency = DEFAULT_CURRENCY;

      const [vehicleOptions, selectableExtras, childSeatExtra] = await Promise.all([
        this.repository.findVehicleOptionsForRoute(
          route.id,
          input.locale,
          quoteCurrency,
        ),
        this.repository.findCustomerSelectableExtras(input.locale),
        this.repository.findChildSeatExtra(input.locale),
      ]);

      const luggageFleetCandidates = mapVehicleOptionsToLuggageFleetCandidates(
        vehicleOptions,
      );

      const vehicleIds = vehicleOptions.map((option) => option.id);

      const [featuresByVehicle, galleryByVehicle] = await Promise.all([
        this.featureRepository
          ? this.featureRepository.listLabelsByVehicleIds(vehicleIds, input.locale)
          : Promise.resolve(new Map<string, string[]>()),
        this.galleryRepository
          ? this.galleryRepository.listBookingPreviewImageKeysByVehicleIds(
              vehicleIds,
            )
          : Promise.resolve(new Map<string, string[]>()),
      ]);

      const capacityPassengerCount = resolveCapacityPassengerCount(
        input.passengerCount,
        input.infantCount,
      );

      const recommendations = recommendVehicles(
        {
          passengerCount: capacityPassengerCount,
          largeLuggageCount: input.largeLuggageCount,
          cabinLuggageCount: input.cabinLuggageCount,
          vehicleCategories: vehicleOptions.map((option) => ({
            id: option.id,
            name: option.translatedName ?? option.defaultName,
            passengerCapacity: option.passengerCapacity,
            largeLuggageCapacity: option.largeLuggageCapacity,
            cabinLuggageCapacity: option.cabinLuggageCapacity,
            isActive: option.isActive,
            sortOrder: option.sortOrder,
          })),
        },
        { includeIneligible: true },
      );

      const extrasById = new Map(
        [...selectableExtras, ...(childSeatExtra ? [childSeatExtra] : [])].map(
          (extra) => [extra.id, extra],
        ),
      );

      const options: TransferVehicleOptionDto[] = [];

      for (const recommendation of recommendations) {
        const vehicleOption = vehicleOptions.find(
          (option) => option.id === recommendation.vehicleCategoryId,
        );

        if (!vehicleOption || !vehicleOption.priceIsActive) {
          continue;
        }

        const { extras: requiredExtras, requiredChildSeats } = buildRequiredExtras(
          childSeatExtra,
          input.infantCount,
          extrasById,
        );

        let eligibility = recommendation.assessment.eligibility;
        const warnings = [...recommendation.assessment.warnings];
        let requiredLuggageVehicle: ReturnType<
          typeof selectCheapestLuggageFleetVehicle
        > = null;

        if (recommendation.assessment.largeLuggageOverflow > 0) {
          requiredLuggageVehicle = selectCheapestLuggageFleetVehicle(
            recommendation.assessment.largeLuggageOverflow,
            luggageFleetCandidates,
            input.tripType,
          );

          if (!requiredLuggageVehicle) {
            eligibility = "INELIGIBLE";
            warnings.push({
              code: "LUGGAGE_VEHICLE_UNAVAILABLE",
              message:
                "No priced fleet vehicle is available to carry overflow luggage",
            });
          }
        }

        const requiredExtraIds = new Set(
          requiredExtras.map((extra) => extra.extraServiceId),
        );

        const optionalExtras = buildOptionalExtras(
          selectableExtras,
          requiredExtraIds,
        );

        let quote = {
          currency: vehicleOption.currency,
          baseItems: [] as ReturnType<typeof calculateQuote>["quote"]["baseItems"],
          extraItems: [] as ReturnType<typeof calculateQuote>["quote"]["extraItems"],
          subtotalMinor: 0,
          totalMinor: 0,
        };

        if (eligibility !== "INELIGIBLE") {
          const quoteVehicles = [
            {
              vehicleCategoryId: vehicleOption.id,
              vehicleCategoryName:
                vehicleOption.translatedName ?? vehicleOption.defaultName,
              quantity: recommendation.quantity,
              oneWayPriceMinor: vehicleOption.oneWayPriceMinor,
              roundTripPriceMinor: vehicleOption.roundTripPriceMinor,
            },
          ];

          if (requiredLuggageVehicle) {
            const luggageFleetOption = vehicleOptions.find(
              (option) =>
                option.id === requiredLuggageVehicle!.vehicleCategoryId,
            );

            if (luggageFleetOption) {
              quoteVehicles.push({
                vehicleCategoryId: luggageFleetOption.id,
                vehicleCategoryName:
                  luggageFleetOption.translatedName ??
                  luggageFleetOption.defaultName,
                quantity: requiredLuggageVehicle.quantity,
                oneWayPriceMinor: luggageFleetOption.oneWayPriceMinor,
                roundTripPriceMinor: luggageFleetOption.roundTripPriceMinor,
              });
            }
          }

          const quoteResult = calculateQuote({
            tripType: input.tripType,
            currency: vehicleOption.currency,
            vehicles: quoteVehicles,
            extras: requiredExtras.map((extra) => ({
              extraServiceId: extra.extraServiceId,
              extraServiceName: extra.name,
              pricingMode: extra.pricingMode,
              quantity: extra.quantity,
              includedQuantity: extra.includedQuantity,
              unitPriceMinor: extra.unitPriceMinor,
              currency: vehicleOption.currency,
            })),
          });

          quote = quoteResult.quote;
        }

        options.push({
          vehicleCategoryId: vehicleOption.id,
          name: vehicleOption.translatedName ?? vehicleOption.defaultName,
          code: vehicleOption.code,
          imageKey: vehicleOption.imageKey,
          galleryImageKeys: galleryByVehicle.get(vehicleOption.id) ?? [],
          quantity: recommendation.quantity,
          passengerCapacity: vehicleOption.passengerCapacity,
          largeLuggageCapacity: vehicleOption.largeLuggageCapacity,
          cabinLuggageCapacity: vehicleOption.cabinLuggageCapacity,
          eligibility,
          requiredLuggageVehicles: requiredLuggageVehicle?.quantity ?? 0,
          requiredLuggageVehicle,
          requiredChildSeats,
          warnings,
          requiredExtras,
          optionalExtras,
          features: featuresByVehicle.get(vehicleOption.id) ?? [],
          quote,
        });
      }

      const currency =
        options.find((option) => option.quote.currency)?.quote.currency ??
        vehicleOptions[0]?.currency;

      if (!currency) {
        throw new DomainRuleError("No vehicle options available for this route");
      }

      let selection: PricedSelectionDto | undefined;

      if (input.selection && this.quoteService) {
        const quoteResult = await this.quoteService.calculateTransferQuote({
          routeId: route.id,
          tripType: input.tripType,
          passengerCount: input.passengerCount,
          infantCount: input.infantCount,
          largeLuggageCount: input.largeLuggageCount,
          cabinLuggageCount: input.cabinLuggageCount,
          vehicles: input.selection.vehicles,
          extras: input.selection.extras,
          locale: input.locale,
        });

        const requiredExtrasById = new Map<string, TransferOptionExtraDto>();

        for (const vehicle of input.selection.vehicles) {
          const matchedOption = options.find(
            (option) => option.vehicleCategoryId === vehicle.vehicleCategoryId,
          );

          if (!matchedOption) {
            continue;
          }

          for (const extra of matchedOption.requiredExtras) {
            const existing = requiredExtrasById.get(extra.extraServiceId);

            if (!existing) {
              requiredExtrasById.set(extra.extraServiceId, { ...extra });
              continue;
            }

            requiredExtrasById.set(extra.extraServiceId, {
              ...existing,
              quantity: Math.max(existing.quantity, extra.quantity),
              totalPriceMinor: Math.max(
                existing.totalPriceMinor,
                extra.totalPriceMinor,
              ),
            });
          }
        }

        selection = {
          vehicles: input.selection.vehicles,
          eligibility: quoteResult.eligibility,
          requiredExtras:
            requiredExtrasById.size > 0
              ? Array.from(requiredExtrasById.values())
              : quoteResult.requiredExtras.map((extra) => ({
                  extraServiceId: extra.extraServiceId,
                  name: "",
                  pricingMode: "PER_UNIT" as const,
                  quantity: extra.quantity,
                  maxQuantity: null,
                  includedQuantity: 0,
                  unitPriceMinor: 0,
                  totalPriceMinor: 0,
                  required: true,
                })),
          quote: quoteResult.quote,
          allItems: quoteResult.allItems,
        };
      }

      return {
        routeId: route.id,
        currency,
        timeZone: PROJECT_TIME_ZONE,
        options,
        selection,
      };
    } catch (error) {
      mapDomainError(error);
    }
  }
}

export function createAvailabilityService(
  repository: PricingReader,
  quoteService?: QuoteService,
  locationRepository?: LocationRepository,
) {
  return new AvailabilityService(repository, quoteService, locationRepository);
}
