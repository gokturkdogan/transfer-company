"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

import { MAX_VEHICLE_GALLERY_IMAGES } from "@/features/vehicles/domain/constants";
import { cn } from "@/lib/utils";

type VehicleImageGalleryProps = {
  coverImage: string;
  galleryImages?: string[];
  alt: string;
  className?: string;
};

export function VehicleImageGallery({
  coverImage,
  galleryImages = [],
  alt,
  className,
}: VehicleImageGalleryProps) {
  const gallery = useMemo(
    () =>
      galleryImages
        .map((image) => image.trim())
        .filter((image) => image.length > 0 && image !== coverImage)
        .slice(0, MAX_VEHICLE_GALLERY_IMAGES),
    [coverImage, galleryImages],
  );

  const allImages = useMemo(() => [coverImage, ...gallery], [coverImage, gallery]);

  const [activeImage, setActiveImage] = useState(coverImage);
  const resolvedActiveImage = allImages.includes(activeImage)
    ? activeImage
    : coverImage;

  const thumbnails = allImages.filter((image) => image !== resolvedActiveImage);

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
              aria-label={`${alt} — ${image === coverImage ? "cover" : "gallery"}`}
            >
              <Image src={image} alt="" fill sizes="96px" className="object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
