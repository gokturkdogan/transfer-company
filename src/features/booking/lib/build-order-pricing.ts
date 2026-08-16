import { calculateExtraTotalMinor } from "@/features/pricing/domain/extra-pricing";
import type { LuggageFleetVehicleSelection } from "@/features/capacity/domain/select-cheapest-luggage-fleet-vehicle";
import type { SelectedExtra, SelectedVehicle } from "@/features/booking/lib/types";
import { mergeOptionalExtras } from "@/features/booking/lib/vehicle-selection-context";
import { getSelectedVehicleOptions } from "@/features/booking/lib/vehicle-selection";
import type { QuoteLineItem } from "@/features/pricing/types";
import type {
  TransferAvailabilityResponseDto,
  TransferVehicleOptionDto,
} from "@/features/pricing/types/dto";

export type OrderExtraLine = {
  id: string;
  name: string;
  quantity: number;
  totalPriceMinor: number;
  required: boolean;
};

export const LUGGAGE_VEHICLE_LINE_ID_PREFIX = "luggage-vehicle:";

function sumPrimaryBaseMinor(baseItems: QuoteLineItem[]): number {
  return baseItems
    .filter((item) => !item.isLuggageOverflowVehicle)
    .reduce((sum, item) => sum + item.totalPriceMinor, 0);
}

function buildLuggageVehicleLine(
  baseItems: QuoteLineItem[],
  requiredLuggageVehicle: LuggageFleetVehicleSelection | null,
): OrderExtraLine | null {
  const luggageItem = baseItems.find((item) => item.isLuggageOverflowVehicle);

  if (luggageItem) {
    return {
      id: `${LUGGAGE_VEHICLE_LINE_ID_PREFIX}${luggageItem.referenceId}`,
      name: luggageItem.name,
      quantity: luggageItem.quantity,
      totalPriceMinor: luggageItem.totalPriceMinor,
      required: true,
    };
  }

  if (!requiredLuggageVehicle) {
    return null;
  }

  return {
    id: `${LUGGAGE_VEHICLE_LINE_ID_PREFIX}${requiredLuggageVehicle.vehicleCategoryId}`,
    name: requiredLuggageVehicle.vehicleCategoryName,
    quantity: requiredLuggageVehicle.quantity,
    totalPriceMinor: requiredLuggageVehicle.totalPriceMinor,
    required: true,
  };
}

function mapRequiredExtras(
  extras: TransferVehicleOptionDto["requiredExtras"],
): OrderExtraLine[] {
  return extras.map((extra) => ({
    id: extra.extraServiceId,
    name: extra.name,
    quantity: extra.quantity,
    totalPriceMinor: extra.totalPriceMinor,
    required: true,
  }));
}

export function buildOrderPricing(
  quote: TransferAvailabilityResponseDto,
  selectedVehicles: SelectedVehicle[],
  selectedExtras: SelectedExtra[],
) {
  const currency = quote.currency;
  const selectedOptions = getSelectedVehicleOptions(
    selectedVehicles,
    quote.options,
  );

  let baseTransferMinor = 0;
  let requiredExtras: OrderExtraLine[] = [];

  if (quote.selection) {
    baseTransferMinor = sumPrimaryBaseMinor(quote.selection.quote.baseItems);
    requiredExtras = mapRequiredExtras(quote.selection.requiredExtras);

    const luggageLine = buildLuggageVehicleLine(
      quote.selection.quote.baseItems,
      selectedOptions.find((option) => option.requiredLuggageVehicle)?.requiredLuggageVehicle ??
        null,
    );

    if (luggageLine) {
      requiredExtras.push(luggageLine);
    }
  } else if (selectedOptions.length === 1) {
    const selectedOption = selectedOptions[0]!;
    baseTransferMinor = sumPrimaryBaseMinor(selectedOption.quote.baseItems);
    requiredExtras = mapRequiredExtras(selectedOption.requiredExtras);

    const luggageLine = buildLuggageVehicleLine(
      selectedOption.quote.baseItems,
      selectedOption.requiredLuggageVehicle,
    );

    if (luggageLine) {
      requiredExtras.push(luggageLine);
    }
  } else {
    for (const selection of selectedVehicles) {
      const option = quote.options.find(
        (item) => item.vehicleCategoryId === selection.vehicleCategoryId,
      );

      if (!option) {
        continue;
      }

      baseTransferMinor +=
        sumPrimaryBaseMinor(option.quote.baseItems) * selection.quantity;

      const luggageLine = buildLuggageVehicleLine(
        option.quote.baseItems,
        option.requiredLuggageVehicle,
      );

      if (luggageLine) {
        requiredExtras.push({
          ...luggageLine,
          id: `${luggageLine.id}:${option.vehicleCategoryId}`,
          totalPriceMinor: luggageLine.totalPriceMinor * selection.quantity,
          quantity: luggageLine.quantity * selection.quantity,
        });
      }
    }
  }

  const optionalCatalogue = mergeOptionalExtras(selectedOptions);

  const optionalExtras: OrderExtraLine[] = selectedExtras
    .map((selected) => {
      const extra = optionalCatalogue.find(
        (item) => item.extraServiceId === selected.extraServiceId,
      );

      if (!extra || selected.quantity <= 0) {
        return null;
      }

      const quantity =
        extra.pricingMode === "FIXED" ? 1 : selected.quantity;

      return {
        id: extra.extraServiceId,
        name: extra.name,
        quantity,
        totalPriceMinor: calculateExtraTotalMinor({
          pricingMode: extra.pricingMode,
          quantity: selected.quantity,
          unitPriceMinor: extra.unitPriceMinor,
          includedQuantity: extra.includedQuantity,
        }),
        required: false,
      };
    })
    .filter((item): item is OrderExtraLine => item !== null);

  const requiredExtrasMinor = requiredExtras.reduce(
    (sum, extra) => sum + extra.totalPriceMinor,
    0,
  );
  const optionalExtrasMinor = optionalExtras.reduce(
    (sum, extra) => sum + extra.totalPriceMinor,
    0,
  );
  const totalMinor =
    baseTransferMinor + requiredExtrasMinor + optionalExtrasMinor;

  return {
    currency,
    baseTransferMinor,
    requiredExtras,
    optionalExtras,
    allExtras: [...requiredExtras, ...optionalExtras],
    totalMinor,
    hasExtras: requiredExtras.length > 0 || optionalExtras.length > 0,
  };
}
