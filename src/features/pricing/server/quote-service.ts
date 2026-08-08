import "server-only";

import { assessVehicleCapacity } from "@/features/capacity/domain/assess-capacity";
import type { LuggageVehicleExtra } from "@/features/capacity/types";
import type { TransferQuoteInputDto } from "@/features/pricing/schemas/quote";
import { calculateQuote } from "@/features/pricing/domain/calculate-quote";
import { PricingDomainError } from "@/features/pricing/domain/errors";
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
import {
  CurrencyRepository,
  resolveQuoteCurrency,
} from "@/features/currencies/server/repository";
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

export class QuoteService {
  constructor(
    private readonly repository: PricingReader,
    private readonly currencyRepository?: CurrencyRepository,
  ) {}

  async calculateTransferQuote(
    input: TransferQuoteInputDto,
  ): Promise<TransferQuoteResponse> {
    try {
      const route = await this.repository.findRouteById(input.routeId);
      assertRouteActive(route);

      const pricingCurrency = this.currencyRepository
        ? await resolveQuoteCurrency(this.currencyRepository)
        : "EUR";

      const luggageVehicleCandidates =
        await this.repository.findLuggageVehicleExtras(input.locale);
      const luggageVehicleExtra = resolveLuggageVehicleExtra(
        luggageVehicleCandidates,
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
          passengerCount: input.passengerCount,
          largeLuggageCount: input.largeLuggageCount,
          cabinLuggageCount: input.cabinLuggageCount,
          passengerCapacity: category.passengerCapacity,
          largeLuggageCapacity: category.largeLuggageCapacity,
          cabinLuggageCapacity: category.cabinLuggageCapacity,
          luggageVehicleExtra,
        });

        allWarnings.push(...assessment.warnings);

        if (assessment.eligibility === "INELIGIBLE") {
          combinedEligibility = "INELIGIBLE";
        } else if (
          assessment.eligibility === "ELIGIBLE_WITH_EXTRAS" &&
          combinedEligibility !== "INELIGIBLE"
        ) {
          combinedEligibility = "ELIGIBLE_WITH_EXTRAS";
        }

        if (
          assessment.requiredLuggageVehicles > 0 &&
          luggageVehicleExtra &&
          luggageVehicleExtra.isActive
        ) {
          requiredExtras.push({
            extraServiceId: luggageVehicleExtra.id,
            quantity: assessment.requiredLuggageVehicles,
          });
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
