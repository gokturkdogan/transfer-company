const DESTINATION_FOLDER_PREFIX = "Home/Destinations";

export function buildDestinationImageFolderPath(code: string): string {
  const normalizedCode = code
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (!normalizedCode) {
    throw new Error("Destination code is required for image upload");
  }

  return `${DESTINATION_FOLDER_PREFIX}/${normalizedCode}`;
}
