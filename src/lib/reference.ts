import {
  RESERVATION_REFERENCE_LENGTH,
  RESERVATION_REFERENCE_PREFIX,
} from "@/config/constants";

const ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

export function generateReservationReference(): string {
  const bytes = new Uint8Array(RESERVATION_REFERENCE_LENGTH);
  crypto.getRandomValues(bytes);

  const suffix = Array.from(bytes, (byte) => ALPHABET[byte % ALPHABET.length]).join(
    "",
  );

  return `${RESERVATION_REFERENCE_PREFIX}-${suffix}`;
}

export function isValidReservationReference(value: string): boolean {
  const pattern = new RegExp(
    `^${RESERVATION_REFERENCE_PREFIX}-[${ALPHABET}]{${RESERVATION_REFERENCE_LENGTH}}$`,
  );

  return pattern.test(value);
}
