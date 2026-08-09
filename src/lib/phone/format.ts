import {
  DEFAULT_PHONE_COUNTRY_CODE,
  getPhoneCountryByIso2,
} from "@/lib/phone/countries";

export function sanitizeNationalPhoneNumber(value: string): string {
  return value.replace(/\D/g, "");
}

export function formatInternationalPhone(
  iso2: string,
  nationalNumber: string,
): string {
  const country =
    getPhoneCountryByIso2(iso2) ??
    getPhoneCountryByIso2(DEFAULT_PHONE_COUNTRY_CODE);
  const digits = sanitizeNationalPhoneNumber(nationalNumber);

  if (!digits || !country) {
    return "";
  }

  return `+${country.dialCode}${digits}`;
}
