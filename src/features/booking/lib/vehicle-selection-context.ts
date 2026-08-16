import type { SelectedVehicle } from "@/features/booking/lib/types";
import { getSelectedVehicleOptions } from "@/features/booking/lib/vehicle-selection";
import type {
  TransferAvailabilityResponseDto,
  TransferOptionExtraDto,
  TransferVehicleOptionDto,
} from "@/features/pricing/types/dto";

export function mergeOptionalExtras(
  options: TransferVehicleOptionDto[],
): TransferOptionExtraDto[] {
  const merged = new Map<string, TransferOptionExtraDto>();

  for (const option of options) {
    for (const extra of option.optionalExtras) {
      if (!merged.has(extra.extraServiceId)) {
        merged.set(extra.extraServiceId, extra);
      }
    }
  }

  return Array.from(merged.values());
}

export function mergeRequiredExtras(
  options: TransferVehicleOptionDto[],
): TransferOptionExtraDto[] {
  const merged = new Map<string, TransferOptionExtraDto>();

  for (const option of options) {
    for (const extra of option.requiredExtras) {
      const existing = merged.get(extra.extraServiceId);

      if (!existing) {
        merged.set(extra.extraServiceId, extra);
        continue;
      }

      merged.set(extra.extraServiceId, {
        ...existing,
        quantity: Math.max(existing.quantity, extra.quantity),
        totalPriceMinor: Math.max(existing.totalPriceMinor, extra.totalPriceMinor),
      });
    }
  }

  return Array.from(merged.values());
}

export function resolveActiveVehicleContext(
  quote: TransferAvailabilityResponseDto | null,
  selectedVehicles: SelectedVehicle[],
): {
  selectedOptions: TransferVehicleOptionDto[];
  requiredExtras: TransferOptionExtraDto[];
  optionalExtras: TransferOptionExtraDto[];
} {
  if (!quote || selectedVehicles.length === 0) {
    return {
      selectedOptions: [],
      requiredExtras: [],
      optionalExtras: [],
    };
  }

  const selectedOptions = getSelectedVehicleOptions(
    selectedVehicles,
    quote.options,
  );

  const requiredExtras =
    quote.selection && quote.selection.requiredExtras.length > 0
      ? quote.selection.requiredExtras
      : mergeRequiredExtras(selectedOptions);

  return {
    selectedOptions,
    requiredExtras,
    optionalExtras: mergeOptionalExtras(selectedOptions),
  };
}

export function sumSelectedLargeLuggageCapacity(
  selectedVehicles: SelectedVehicle[],
  options: TransferVehicleOptionDto[],
): number {
  return selectedVehicles.reduce((sum, selection) => {
    const option = options.find(
      (item) => item.vehicleCategoryId === selection.vehicleCategoryId,
    );

    if (!option) {
      return sum;
    }

    return sum + option.largeLuggageCapacity * selection.quantity;
  }, 0);
}
