"use client";

import Image from "next/image";

import { BRAND_IMAGES } from "@/config/brand";

const EMBLEM_SIZE = 128;
const VIEW = 128;
const STROKE_INSET = 2.5;
const RADIUS = 22;
const SIZE = VIEW - STROKE_INSET * 2;

/**
 * Premium brand emblem with an edge-following border spinner.
 * SVG stroke travels the rounded rect path — no rotating box spill.
 */
export function BrandLoaderEmblem({ alt }: { alt: string }) {
  return (
    <div className="relative h-20 w-20 sm:h-24 sm:w-24" aria-hidden>
      <span className="brand-loader-glow pointer-events-none absolute inset-[-10%] rounded-[1.75rem]" />

      <div className="brand-loader-breathe relative h-full w-full overflow-hidden rounded-2xl sm:rounded-3xl">
        <Image
          src={BRAND_IMAGES.loaderEmblem}
          alt={alt}
          width={EMBLEM_SIZE}
          height={EMBLEM_SIZE}
          priority
          className="h-full w-full object-contain"
        />

        <span
          className="brand-loader-shine pointer-events-none absolute inset-0"
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

      <svg
        className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
        viewBox={`0 0 ${VIEW} ${VIEW}`}
        fill="none"
        aria-hidden
      >
        <defs>
          <linearGradient
            id="brand-loader-stroke"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <stop offset="0%" stopColor="#9c7c42" stopOpacity="0.2" />
            <stop offset="35%" stopColor="#c8a45d" stopOpacity="0.85" />
            <stop offset="65%" stopColor="#f5e8c4" stopOpacity="1" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="1" />
          </linearGradient>
        </defs>

        <rect
          x={STROKE_INSET}
          y={STROKE_INSET}
          width={SIZE}
          height={SIZE}
          rx={RADIUS}
          ry={RADIUS}
          pathLength={1}
          className="brand-loader-ring-track"
        />

        <rect
          x={STROKE_INSET}
          y={STROKE_INSET}
          width={SIZE}
          height={SIZE}
          rx={RADIUS}
          ry={RADIUS}
          pathLength={1}
          strokeDasharray="0.22 0.78"
          className="brand-loader-ring-stroke"
        />
      </svg>
    </div>
  );
}
