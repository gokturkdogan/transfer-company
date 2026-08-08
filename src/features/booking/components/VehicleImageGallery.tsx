"use client";

import Image from "next/image";
import { useState } from "react";

import { cn } from "@/lib/utils";

type VehicleImageGalleryProps = {
  images: string[];
  alt: string;
  className?: string;
};

export function VehicleImageGallery({ images, alt, className }: VehicleImageGalleryProps) {
  const galleryImages = images.length > 0 ? images : [images[0]];
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = galleryImages[activeIndex] ?? galleryImages[0];

  return (
    <div className={cn("flex h-full flex-col gap-2", className)}>
      <div className="relative min-h-[11rem] flex-1 overflow-hidden rounded-xl bg-muted sm:min-h-[13.5rem]">
        <Image
          key={activeImage}
          src={activeImage}
          alt={alt}
          fill
          sizes="(max-width: 1024px) 100vw, 320px"
          className="object-cover transition-opacity duration-300"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/45 via-transparent to-transparent"
        />
      </div>

      {galleryImages.length > 1 && (
        <div className="grid grid-cols-3 gap-2">
          {galleryImages.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={cn(
                "relative aspect-[4/3] overflow-hidden rounded-lg border-2 transition-colors",
                index === activeIndex
                  ? "border-gold shadow-[0_0_0_1px_rgb(200_164_93/0.35)]"
                  : "border-transparent opacity-75 hover:border-gold/35 hover:opacity-100",
              )}
              aria-label={`${alt} ${index + 1}`}
              aria-pressed={index === activeIndex}
            >
              <Image src={image} alt="" fill sizes="96px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
