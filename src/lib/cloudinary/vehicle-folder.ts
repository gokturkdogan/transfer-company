const TURKISH_CHAR_MAP: Record<string, string> = {
  ç: "c",
  Ç: "c",
  ğ: "g",
  Ğ: "g",
  ı: "i",
  İ: "i",
  ö: "o",
  Ö: "o",
  ş: "s",
  Ş: "s",
  ü: "u",
  Ü: "u",
};

function normalizeSegment(value: string): string {
  const transliterated = value
    .trim()
    .slice(0, 48)
    .split("")
    .map((char) => TURKISH_CHAR_MAP[char] ?? char)
    .join("");

  return transliterated
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function buildVehicleImageFolderSlug(
  code: string,
  brand: string,
  model: string,
): string {
  const segments = [code, brand, model]
    .map(normalizeSegment)
    .filter((segment) => segment.length > 0);

  if (segments.length === 0) {
    throw new Error("VEHICLE_IDENTITY_REQUIRED");
  }

  return segments.join("-").slice(0, 180).replace(/-+$/g, "");
}

export function buildVehicleImageFolderPath(
  code: string,
  brand: string,
  model: string,
): string {
  return `Home/Cars/${buildVehicleImageFolderSlug(code, brand, model)}`;
}

export function buildVehicleImagePublicId(
  code: string,
  brand: string,
  model: string,
  assetName: string,
): string {
  return `${buildVehicleImageFolderPath(code, brand, model)}/${assetName}`;
}
