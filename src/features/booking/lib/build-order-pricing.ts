import { calculateExtraTotalMinor } from "@/features/pricing/domain/extra-pricing";
import type { SelectedExtra, SelectedVehicle } from "@/features/booking/lib/types";
import { mergeOptionalExtras } from "@/features/booking/lib/vehicle-selection-context";
import { getSelectedVehicleOptions } from "@/features/booking/lib/vehicle-selection";
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
    baseTransferMinor = quote.selection.quote.baseItems.reduce(
      (sum, item) => sum + item.totalPriceMinor,
      0,
    );
    requiredExtras = quote.selection.requiredExtras.map((extra) => ({
      id: extra.extraServiceId,
      name: extra.name,
      quantity: extra.quantity,
      totalPriceMinor: extra.totalPriceMinor,
      required: true,
    }));
  } else if (selectedOptions.length === 1) {
    const selectedOption = selectedOptions[0]!;
    baseTransferMinor = selectedOption.quote.baseItems.reduce(
      (sum, item) => sum + item.totalPriceMinor,
      0,
    );
    requiredExtras = selectedOption.requiredExtras.map((extra) => ({
      id: extra.extraServiceId,
      name: extra.name,
      quantity: extra.quantity,
      totalPriceMinor: extra.totalPriceMinor,
      required: true,
    }));
  } else {
    for (const selection of selectedVehicles) {
      const option = quote.options.find(
        (item) => item.vehicleCategoryId === selection.vehicleCategoryId,
      );

      if (!option) {
        continue;
      }

      baseTransferMinor += option.quote.baseItems.reduce(
        (sum, item) => sum + item.totalPriceMinor * selection.quantity,
        0,
      );
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
