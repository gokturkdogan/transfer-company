import "server-only";

import { assessVehicleCapacity } from "@/features/capacity/domain/assess-capacity";
import { resolveCapacityPassengerCount } from "@/features/capacity/domain/capacity-passenger-count";
import { selectCheapestLuggageFleetVehicle } from "@/features/capacity/domain/select-cheapest-luggage-fleet-vehicle";
import type { TransferQuoteInputDto } from "@/features/pricing/schemas/quote";
import { calculateQuote } from "@/features/pricing/domain/calculate-quote";
import { PricingDomainError } from "@/features/pricing/domain/errors";
import { mapVehicleOptionsToLuggageFleetCandidates } from "@/features/pricing/domain/luggage-fleet-vehicle";
import {
  resolveIncludedQuantityForRequiredChildSeats,
  resolveRequiredChildSeatQuantity,
} from "@/features/pricing/domain/required-child-seats";
import {
  assertCurrencyConsistency,
  assertExtraBookable,
  assertExtraCustomerSelectable,
  assertRouteActive,
  assertRoutePriceBookable,
  assertVehicleBookable,
} from "@/features/pricing/domain/guards";
import type {
  QuoteExtraSelection,
  QuoteVehicleSelection,
  TransferQuoteResult,
} from "@/features/pricing/types";
import type { PricingReader } from "@/features/pricing/server/reader";
import { DEFAULT_CURRENCY } from "@/config/constants";
import { DomainRuleError } from "@/server/errors";

export type TransferQuoteResponse = TransferQuoteResult & {
  eligibility: "ELIGIBLE" | "ELIGIBLE_WITH_EXTRAS" | "INELIGIBLE";
  capacityWarnings: ReturnType<typeof assessVehicleCapacity>["warnings"];
  requiredExtras: Array<{ extraServiceId: string; quantity: number }>;
};

function mapDomainError(error: unknown): never {
  if (error instanceof PricingDomainError) {
    throw new DomainRuleError(error.message);
  }

  throw error;
}

export class QuoteService {
  constructor(private readonly repository: PricingReader) {}

  async calculateTransferQuote(
    input: TransferQuoteInputDto,
  ): Promise<TransferQuoteResponse> {
    try {
      const route = await this.repository.findRouteById(input.routeId);
      assertRouteActive(route);

      const pricingCurrency = DEFAULT_CURRENCY;

      const [fleetVehicleOptions, childSeatExtra] = await Promise.all([
        this.repository.findVehicleOptionsForRoute(
          input.routeId,
          input.locale,
          pricingCurrency,
        ),
        this.repository.findChildSeatExtra(input.locale),
      ]);
      const luggageFleetCandidates = mapVehicleOptionsToLuggageFleetCandidates(
        fleetVehicleOptions,
      );
      const requiredChildSeats = resolveRequiredChildSeatQuantity(
        input.infantCount,
        childSeatExtra,
      );
      const capacityPassengerCount = resolveCapacityPassengerCount(
        input.passengerCount,
        input.infantCount,
      );

      const vehicleSelections: QuoteVehicleSelection[] = [];
      let combinedEligibility:
        | "ELIGIBLE"
        | "ELIGIBLE_WITH_EXTRAS"
        | "INELIGIBLE" = "ELIGIBLE";
      const allWarnings: ReturnType<
        typeof assessVehicleCapacity
      >["warnings"] = [];
      const requiredExtras: Array<{ extraServiceId: string; quantity: number }> =
        [];
      let quoteCurrency: string | null = null;
      let primaryAssessment: ReturnType<typeof assessVehicleCapacity> | null =
        null;

      for (const selection of input.vehicles) {
        const category = await this.repository.findVehicleCategoryById(
          selection.vehicleCategoryId,
        );
        assertVehicleBookable(category);

        const price = await this.repository.findRoutePrice(
          input.routeId,
          selection.vehicleCategoryId,
          pricingCurrency,
        );
        assertRoutePriceBookable(
          price,
          input.routeId,
          selection.vehicleCategoryId,
        );

        if (quoteCurrency === null) {
          quoteCurrency = price.currency;
        } else {
          assertCurrencyConsistency(quoteCurrency, price.currency, "route price");
        }

        const translation =
          await this.repository.findVehicleCategoryTranslation(
            selection.vehicleCategoryId,
            input.locale,
          );

        const assessment = assessVehicleCapacity({
          vehicleQuantity: selection.quantity,
          passengerCount: capacityPassengerCount,
          largeLuggageCount: input.largeLuggageCount,
          cabinLuggageCount: input.cabinLuggageCount,
          passengerCapacity: category.passengerCapacity,
          largeLuggageCapacity: category.largeLuggageCapacity,
          cabinLuggageCapacity: category.cabinLuggageCapacity,
        });

        primaryAssessment = assessment;
        allWarnings.push(...assessment.warnings);

        if (assessment.eligibility === "INELIGIBLE") {
          combinedEligibility = "INELIGIBLE";
        } else if (
          assessment.eligibility === "ELIGIBLE_WITH_EXTRAS" &&
          combinedEligibility !== "INELIGIBLE"
        ) {
          combinedEligibility = "ELIGIBLE_WITH_EXTRAS";
        }

        vehicleSelections.push({
          vehicleCategoryId: selection.vehicleCategoryId,
          vehicleCategoryName:
            translation?.name ?? category.defaultName,
          quantity: selection.quantity,
          oneWayPriceMinor: price.oneWayPriceMinor,
          roundTripPriceMinor: price.roundTripPriceMinor,
        });
      }

      if (
        primaryAssessment &&
        primaryAssessment.largeLuggageOverflow > 0 &&
        combinedEligibility !== "INELIGIBLE"
      ) {
        const luggageFleetVehicle = selectCheapestLuggageFleetVehicle(
          primaryAssessment.largeLuggageOverflow,
          luggageFleetCandidates,
          input.tripType,
        );

        if (!luggageFleetVehicle) {
          combinedEligibility = "INELIGIBLE";
          allWarnings.push({
            code: "LUGGAGE_VEHICLE_UNAVAILABLE",
            message:
              "No priced fleet vehicle is available to carry overflow luggage",
          });
        } else {
          const luggageFleetOption = fleetVehicleOptions.find(
            (option) => option.id === luggageFleetVehicle.vehicleCategoryId,
          );

          if (!luggageFleetOption || !luggageFleetOption.priceIsActive) {
            combinedEligibility = "INELIGIBLE";
            allWarnings.push({
              code: "LUGGAGE_VEHICLE_UNAVAILABLE",
              message:
                "No priced fleet vehicle is available to carry overflow luggage",
            });
          } else {
            assertCurrencyConsistency(
              quoteCurrency!,
              luggageFleetOption.currency,
              "route price",
            );

            vehicleSelections.push({
              vehicleCategoryId: luggageFleetVehicle.vehicleCategoryId,
              vehicleCategoryName: luggageFleetVehicle.vehicleCategoryName,
              quantity: luggageFleetVehicle.quantity,
              oneWayPriceMinor: luggageFleetOption.oneWayPriceMinor,
              roundTripPriceMinor: luggageFleetOption.roundTripPriceMinor,
            });
          }
        }
      }

      if (requiredChildSeats > 0 && childSeatExtra) {
        const existingChildSeat = requiredExtras.find(
          (extra) => extra.extraServiceId === childSeatExtra.id,
        );

        if (existingChildSeat) {
          existingChildSeat.quantity = Math.max(
            existingChildSeat.quantity,
            requiredChildSeats,
          );
        } else {
          requiredExtras.push({
            extraServiceId: childSeatExtra.id,
            quantity: requiredChildSeats,
          });
        }
      }

      if (combinedEligibility === "INELIGIBLE") {
        return {
          quote: {
            currency: quoteCurrency ?? "EUR",
            baseItems: [],
            extraItems: [],
            subtotalMinor: 0,
            totalMinor: 0,
          },
          allItems: [],
          eligibility: combinedEligibility,
          capacityWarnings: allWarnings,
          requiredExtras,
        };
      }

      const extraSelections: QuoteExtraSelection[] = [];
      const mergedExtras = new Map<string, number>();
      const requiredExtraIds = new Set(
        requiredExtras.map((extra) => extra.extraServiceId),
      );

      for (const extra of input.extras) {
        mergedExtras.set(
          extra.extraServiceId,
          (mergedExtras.get(extra.extraServiceId) ?? 0) + extra.quantity,
        );
      }

      for (const required of requiredExtras) {
        mergedExtras.set(
          required.extraServiceId,
          Math.max(
            mergedExtras.get(required.extraServiceId) ?? 0,
            required.quantity,
          ),
        );
      }

      for (const [extraServiceId, quantity] of mergedExtras.entries()) {
        const extra = await this.repository.findExtraServiceById(extraServiceId);
        assertExtraBookable(extra, quantity);

        if (!requiredExtraIds.has(extraServiceId)) {
          assertExtraCustomerSelectable(extra);
        }

        assertCurrencyConsistency(
          quoteCurrency!,
          extra.currency,
          "extra service",
        );

        const translation = await this.repository.findExtraServiceTranslation(
          extraServiceId,
          input.locale,
        );

        extraSelections.push({
          extraServiceId,
          extraServiceName: translation?.name ?? extra.code,
          pricingMode: extra.pricingMode,
          quantity,
          includedQuantity:
            childSeatExtra && extraServiceId === childSeatExtra.id
              ? resolveIncludedQuantityForRequiredChildSeats(
                  requiredChildSeats,
                  extra.includedQuantity,
                )
              : extra.includedQuantity,
          unitPriceMinor: extra.priceMinor,
          currency: extra.currency,
        });
      }

      const result = calculateQuote({
        tripType: input.tripType,
        currency: quoteCurrency!,
        vehicles: vehicleSelections,
        extras: extraSelections,
      });

      return {
        ...result,
        eligibility: combinedEligibility,
        capacityWarnings: allWarnings,
        requiredExtras,
      };
    } catch (error) {
      mapDomainError(error);
    }
  }
}

export function createQuoteService(repository: PricingReader) {
  return new QuoteService(repository);
}
