import { getFleetImage } from "@/config/homepage-images";
import {
  MAX_VEHICLE_BOOKING_PREVIEW_IMAGES,
  MAX_VEHICLE_GALLERY_IMAGES,
} from "@/features/vehicles/domain/constants";

export function resolveVehicleCoverImage(
  imageKey: string | null | undefined,
  code?: string | null,
): string {
  const trimmed = imageKey?.trim();

  if (trimmed) {
    return trimmed;
  }

  if (code?.trim()) {
    return getFleetImage(code);
  }

  return getFleetImage("VITO");
}

export function resolveVehicleCoverImages(
  imageKey: string | null | undefined,
  code?: string | null,
): string[] {
  return [resolveVehicleCoverImage(imageKey, code)];
}

export function resolveVehicleGalleryImages(
  imageKey: string | null | undefined,
  galleryImageKeys: string[] | null | undefined,
  code?: string | null,
): string[] {
  const cover = resolveVehicleCoverImage(imageKey, code);
  const gallery = (galleryImageKeys ?? [])
    .map((key) => key.trim())
    .filter((key) => key.length > 0 && key !== cover)
    .slice(0, MAX_VEHICLE_BOOKING_PREVIEW_IMAGES);

  return [cover, ...gallery];
}

export function resolveFleetDetailImages(
  imageKey: string | null | undefined,
  galleryImageKeys: string[] | null | undefined,
  code?: string | null,
): string[] {
  const cover = resolveVehicleCoverImage(imageKey, code);
  const seen = new Set<string>([cover]);
  const result = [cover];

  for (const key of galleryImageKeys ?? []) {
    const trimmed = key.trim();

    if (!trimmed || seen.has(trimmed)) {
      continue;
    }

    seen.add(trimmed);
    result.push(trimmed);

    if (result.length >= MAX_VEHICLE_GALLERY_IMAGES) {
      break;
    }
  }

  return result;
}
