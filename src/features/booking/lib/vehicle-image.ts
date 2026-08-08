import { ABOUT_IMAGES } from "@/config/about-images";

const VEHICLE_GALLERY_FALLBACK = [
  ABOUT_IMAGES.chauffeur,
  ABOUT_IMAGES.meetGreet,
  ABOUT_IMAGES.hero,
] as const;

/** Best-effort fleet visuals until availability DTO exposes imageKey. */
export function getVehicleImagesForName(name: string): string[] {
  const normalized = name.toUpperCase();

  if (normalized.includes("SPRINTER")) {
    return [ABOUT_IMAGES.meetGreet, ABOUT_IMAGES.chauffeur, ABOUT_IMAGES.hero];
  }

  if (normalized.includes("SEDAN")) {
    return [ABOUT_IMAGES.chauffeur, ABOUT_IMAGES.hero, ABOUT_IMAGES.meetGreet];
  }

  if (normalized.includes("VITO")) {
    return [ABOUT_IMAGES.chauffeur, ABOUT_IMAGES.meetGreet, ABOUT_IMAGES.hero];
  }

  return [...VEHICLE_GALLERY_FALLBACK];
}

export function getVehicleImageForName(name: string): string {
  return getVehicleImagesForName(name)[0] ?? ABOUT_IMAGES.chauffeur;
}
