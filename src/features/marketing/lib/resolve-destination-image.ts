import { getDestinationImage } from "@/config/homepage-images";

export function resolveDestinationImage(
  imageKey: string | null | undefined,
  code: string,
): string {
  const trimmed = imageKey?.trim();

  if (trimmed) {
    return trimmed;
  }

  return getDestinationImage(code);
}
