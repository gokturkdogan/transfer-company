/**
 * Passengers that occupy vehicle capacity: adults + children + infants.
 * `passengerCount` on quote/availability input already includes adults and children.
 */
export function resolveCapacityPassengerCount(
  passengerCount: number,
  infantCount = 0,
): number {
  return passengerCount + infantCount;
}
