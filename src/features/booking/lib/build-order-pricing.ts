import type { SelectedExtra } from "@/features/booking/lib/types";
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
  selectedOption: TransferVehicleOptionDto,
  quote: TransferAvailabilityResponseDto,
  selectedExtras: SelectedExtra[],
) {
  const currency = quote.currency;
  const baseTransferMinor = selectedOption.quote.baseItems.reduce(
    (sum, item) => sum + item.totalPriceMinor,
    0,
  );

  const requiredExtras: OrderExtraLine[] = selectedOption.requiredExtras.map(
    (extra) => ({
      id: extra.extraServiceId,
      name: extra.name,
      quantity: extra.quantity,
      totalPriceMinor: extra.totalPriceMinor,
      required: true,
    }),
  );

  const optionalExtras: OrderExtraLine[] = selectedExtras
    .map((selected) => {
      const extra = selectedOption.optionalExtras.find(
        (item) => item.extraServiceId === selected.extraServiceId,
      );

      if (!extra || selected.quantity <= 0) {
        return null;
      }

      return {
        id: extra.extraServiceId,
        name: extra.name,
        quantity: selected.quantity,
        totalPriceMinor: extra.unitPriceMinor * selected.quantity,
        required: false,
      };
    })
    .filter((item): item is OrderExtraLine => item !== null);

  const totalMinor =
    quote.selection?.quote.totalMinor ?? selectedOption.quote.totalMinor;

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
