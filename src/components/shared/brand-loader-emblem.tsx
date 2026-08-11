"use client";

import Image from "next/image";

import { BRAND_IMAGES } from "@/config/brand";

const EMBLEM_SIZE = 128;

/**
 * Premium brand emblem with sweeping shine + soft glow for the global loader.
 */
export function BrandLoaderEmblem({ alt }: { alt: string }) {
  return (
    <div className="relative h-28 w-28 sm:h-32 sm:w-32" aria-hidden>
      <span className="brand-loader-glow absolute inset-[-18%] rounded-full" />

      <div className="brand-loader-breathe relative h-full w-full overflow-hidden rounded-2xl sm:rounded-3xl">
        <Image
          src={BRAND_IMAGES.loaderEmblem}
          alt={alt}
          width={EMBLEM_SIZE}
          height={EMBLEM_SIZE}
          priority
          className="h-full w-full rounded-2xl object-contain drop-shadow-[0_0_28px_rgba(200,164,93,0.35)] sm:rounded-3xl"
        />

        <span
          className="brand-loader-shine pointer-events-none absolute inset-0 rounded-2xl sm:rounded-3xl"
          style={{
            WebkitMaskImage: `url(${BRAND_IMAGES.loaderEmblem})`,
            maskImage: `url(${BRAND_IMAGES.loaderEmblem})`,
            WebkitMaskSize: "contain",
            maskSize: "contain",
            WebkitMaskRepeat: "no-repeat",
            maskRepeat: "no-repeat",
            WebkitMaskPosition: "center",
            maskPosition: "center",
          }}
        />

        <span className="brand-loader-glint brand-loader-glint--a" />
        <span className="brand-loader-glint brand-loader-glint--b" />
        <span className="brand-loader-glint brand-loader-glint--c" />
      </div>
    </div>
  );
}
