"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

import { MAX_VEHICLE_BOOKING_PREVIEW_IMAGES } from "@/features/vehicles/domain/constants";
import { cn } from "@/lib/utils";

type VehicleImageGalleryProps = {
  images: string[];
  alt: string;
  className?: string;
};

export function VehicleImageGallery({
  images,
  alt,
  className,
}: VehicleImageGalleryProps) {
  const gallery = useMemo(
    () =>
      images
        .map((image) => image.trim())
        .filter((image) => image.length > 0)
        .slice(0, MAX_VEHICLE_BOOKING_PREVIEW_IMAGES),
    [images],
  );

  const [activeImage, setActiveImage] = useState(gallery[0] ?? "");
  const resolvedActiveImage = gallery.includes(activeImage)
    ? activeImage
    : (gallery[0] ?? "");

  const thumbnails = gallery.filter((image) => image !== resolvedActiveImage);

  if (gallery.length === 0) {
    return null;
  }

  return (
    <div className={cn("flex w-full flex-col gap-2", className)}>
      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-muted">
        <Image
          key={resolvedActiveImage}
          src={resolvedActiveImage}
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

      {thumbnails.length > 0 ? (
        <div className="grid grid-cols-3 gap-2">
          {thumbnails.map((image) => (
            <button
              key={image}
              type="button"
              onClick={() => setActiveImage(image)}
              className={cn(
                "relative aspect-video cursor-pointer overflow-hidden rounded-lg border-2 border-transparent opacity-90 transition-all",
                "hover:border-gold/35 hover:opacity-100",
              )}
              aria-label={`${alt} — gallery`}
            >
              <Image src={image} alt="" fill sizes="96px" className="object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
