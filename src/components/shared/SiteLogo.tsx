import Image from "next/image";

import { BRAND_IMAGES } from "@/config/brand";
import { cn } from "@/lib/utils";

/** Horizontal wordmark — emblem + Royal Rhein text (~3:1). */
const LOGO_INTRINSIC_WIDTH = 750;
const LOGO_INTRINSIC_HEIGHT = 250;

type SiteLogoProps = {
  alt: string;
  className?: string;
  imageClassName?: string;
  size?: "default" | "header";
};

const LOGO_SIZE_CLASSES = {
  default: "h-11 w-auto max-w-[min(82vw,17rem)] sm:h-12 sm:max-w-[19rem]",
  header:
    "h-12 w-auto max-w-[min(88vw,19rem)] sm:h-[3.25rem] sm:max-w-[21.5rem] md:h-16 md:max-w-[24rem]",
} as const;

export function SiteLogo({
  alt,
  className,
  imageClassName,
  size = "default",
}: SiteLogoProps) {
  return (
    <span className={cn("relative inline-flex shrink-0 items-center", className)}>
      <Image
        src={BRAND_IMAGES.logo}
        alt={alt}
        width={LOGO_INTRINSIC_WIDTH}
        height={LOGO_INTRINSIC_HEIGHT}
        priority
        unoptimized
        className={cn(
          "h-auto w-auto object-contain object-left transition-transform duration-300 group-hover:scale-[1.02]",
          LOGO_SIZE_CLASSES[size],
          imageClassName,
        )}
      />
    </span>
  );
}
