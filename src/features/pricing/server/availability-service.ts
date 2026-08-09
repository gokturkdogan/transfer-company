import "server-only";

import { recommendVehicles } from "@/features/capacity/domain/recommend-vehicles";
import { calculateExtraTotalMinor } from "@/features/pricing/domain/extra-pricing";
import type { LuggageVehicleExtra } from "@/features/capacity/types";
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

function resolveLuggageVehicleExtra(
  extras: Awaited<ReturnType<PricingReader["findLuggageVehicleExtras"]>>,
): LuggageVehicleExtra | null {
  const candidate = extras.find(
    (extra) => extra.luggageCapacityPerUnit !== null,
  );

  if (!candidate || candidate.luggageCapacityPerUnit === null) {
    return null;
  }

  return {
    id: candidate.id,
    isActive: candidate.isActive,
    luggageCapacityPerUnit: candidate.luggageCapacityPerUnit,
    maxQuantity: candidate.maxQuantity,
  };
}

function buildRequiredExtras(
  assessment: ReturnType<typeof recommendVehicles>[number]["assessment"],
  luggageVehicleExtra: LuggageVehicleExtra | null,
  extrasById: Map<
    string,
    Awaited<ReturnType<PricingReader["findCustomerSelectableExtras"]>>[number]
  >,
): TransferOptionExtraDto[] {
  if (
    assessment.requiredLuggageVehicles <= 0 ||
    !luggageVehicleExtra ||
    !luggageVehicleExtra.isActive
  ) {
    return [];
  }

  const extra = extrasById.get(luggageVehicleExtra.id);

  if (!extra) {
    return [];
  }

  const quantity = assessment.requiredLuggageVehicles;

  return [
    {
      extraServiceId: extra.id,
      name: extra.translatedName ?? extra.code,
      pricingMode: extra.pricingMode,
      quantity,
      maxQuantity: extra.maxQuantity,
      includedQuantity: extra.includedQuantity,
      unitPriceMinor: extra.priceMinor,
      totalPriceMinor: calculateExtraTotalMinor({
        pricingMode: extra.pricingMode,
        quantity,
        unitPriceMinor: extra.priceMinor,
        includedQuantity: extra.includedQuantity,
      }),
      required: true,
    },
  ];
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

      const [vehicleOptions, luggageVehicleCandidates, selectableExtras] =
        await Promise.all([
          this.repository.findVehicleOptionsForRoute(
            route.id,
            input.locale,
            quoteCurrency,
          ),
          this.repository.findLuggageVehicleExtras(input.locale),
          this.repository.findCustomerSelectableExtras(input.locale),
        ]);

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

      const luggageVehicleExtra = resolveLuggageVehicleExtra(
        luggageVehicleCandidates,
      );

      const recommendations = recommendVehicles(
        {
          passengerCount: input.passengerCount,
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
          luggageVehicleExtra,
        },
        { includeIneligible: true },
      );

      const extrasById = new Map(
        [...luggageVehicleCandidates, ...selectableExtras].map((extra) => [
          extra.id,
          extra,
        ]),
      );

      const options: TransferVehicleOptionDto[] = [];

      for (const recommendation of recommendations) {
        const vehicleOption = vehicleOptions.find(
          (option) => option.id === recommendation.vehicleCategoryId,
        );

        if (!vehicleOption || !vehicleOption.priceIsActive) {
          continue;
        }

        const requiredExtras = buildRequiredExtras(
          recommendation.assessment,
          luggageVehicleExtra,
          extrasById,
        );

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

        if (recommendation.assessment.eligibility !== "INELIGIBLE") {
          const quoteResult = calculateQuote({
            tripType: input.tripType,
            currency: vehicleOption.currency,
            vehicles: [
              {
                vehicleCategoryId: vehicleOption.id,
                vehicleCategoryName:
                  vehicleOption.translatedName ?? vehicleOption.defaultName,
                quantity: recommendation.quantity,
                oneWayPriceMinor: vehicleOption.oneWayPriceMinor,
                roundTripPriceMinor: vehicleOption.roundTripPriceMinor,
              },
            ],
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
          eligibility: recommendation.assessment.eligibility,
          requiredLuggageVehicles:
            recommendation.assessment.requiredLuggageVehicles,
          warnings: recommendation.assessment.warnings,
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
          largeLuggageCount: input.largeLuggageCount,
          cabinLuggageCount: input.cabinLuggageCount,
          vehicles: [
            {
              vehicleCategoryId: input.selection.vehicleCategoryId,
              quantity: input.selection.quantity,
            },
          ],
          extras: input.selection.extras,
          locale: input.locale,
        });

        const matchedOption = options.find(
          (option) =>
            option.vehicleCategoryId === input.selection!.vehicleCategoryId,
        );

        selection = {
          vehicleCategoryId: input.selection.vehicleCategoryId,
          quantity: input.selection.quantity,
          eligibility: quoteResult.eligibility,
          requiredExtras:
            matchedOption?.requiredExtras ??
            quoteResult.requiredExtras.map((extra) => ({
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
