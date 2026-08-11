type ChildSeatExtra = {
  id: string;
  isActive: boolean;
  maxQuantity: number | null;
};

export function resolveRequiredChildSeatQuantity(
  infantCount: number,
  childSeatExtra: ChildSeatExtra | null,
): number {
  if (infantCount <= 0 || !childSeatExtra?.isActive) {
    return 0;
  }

  const maxQuantity = childSeatExtra.maxQuantity ?? infantCount;

  return Math.min(infantCount, maxQuantity);
}
