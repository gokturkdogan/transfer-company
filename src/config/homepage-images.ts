export const HOMEPAGE_IMAGES = {
  hero: "/images/homepage/hero-airport-transfer.jpg",
  destinations: {
    BELEK: "/images/homepage/dest-belek.jpg",
    KEMER: "/images/homepage/dest-kemer.jpg",
    SIDE: "/images/homepage/dest-side.jpg",
    ALANYA: "/images/homepage/dest-alanya.jpg",
    LARA: "/images/homepage/dest-lara.jpg",
  },
  fleet: {
    VITO: "/images/homepage/fleet-vito.jpg",
    SPRINTER: "/images/homepage/fleet-sprinter.jpg",
    SEDAN: "/images/homepage/fleet-sedan.jpg",
  },
  howItWorks: {
    meetGreet: "/images/homepage/meet.png",
  },
} as const;

export function getDestinationImage(code: string): string {
  const key = code.toUpperCase() as keyof typeof HOMEPAGE_IMAGES.destinations;
  return HOMEPAGE_IMAGES.destinations[key] ?? HOMEPAGE_IMAGES.destinations.BELEK;
}

export function getFleetImage(code: string): string {
  const key = code.toUpperCase() as keyof typeof HOMEPAGE_IMAGES.fleet;
  return HOMEPAGE_IMAGES.fleet[key] ?? HOMEPAGE_IMAGES.fleet.VITO;
}
