"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";

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
  const t = useTranslations("home.carousel");

  const gallery = useMemo(
    () =>
      images
        .map((image) => image.trim())
        .filter((image, index, all) => image.length > 0 && all.indexOf(image) === index)
        .slice(0, MAX_VEHICLE_BOOKING_PREVIEW_IMAGES + 1),
    [images],
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const imageSignature = gallery.join("|");
  const safeIndex =
    gallery.length === 0 ? 0 : Math.min(activeIndex, gallery.length - 1);
  const activeImage = gallery[safeIndex] ?? gallery[0] ?? "";
  const hasMultiple = gallery.length > 1;

  useEffect(() => {
    setActiveIndex(0);
  }, [imageSignature]);

  const showPrevious = () => {
    setActiveIndex((current) =>
      current === 0 ? gallery.length - 1 : current - 1,
    );
  };

  const showNext = () => {
    setActiveIndex((current) =>
      current === gallery.length - 1 ? 0 : current + 1,
    );
  };

  if (gallery.length === 0 || !activeImage) {
    return null;
  }

  return (
    <div className={cn("flex w-full flex-col gap-2", className)}>
      <div className="group relative aspect-video w-full overflow-hidden rounded-xl bg-muted">
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

        {hasMultiple ? (
          <>
            <button
              type="button"
              onClick={showPrevious}
              className="absolute start-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-ink/70 text-white shadow-lg backdrop-blur-sm transition-opacity hover:bg-ink/85 md:opacity-0 md:group-hover:opacity-100"
              aria-label={t("previousImage", { alt })}
            >
              <ChevronLeft className="h-4 w-4 rtl:rotate-180" aria-hidden />
            </button>
            <button
              type="button"
              onClick={showNext}
              className="absolute end-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-ink/70 text-white shadow-lg backdrop-blur-sm transition-opacity hover:bg-ink/85 md:opacity-0 md:group-hover:opacity-100"
              aria-label={t("nextImage", { alt })}
            >
              <ChevronRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
            </button>

            <div className="absolute inset-x-0 bottom-2 z-10 flex items-center justify-center gap-1.5">
              {gallery.map((image, index) => (
                <button
                  key={image}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={cn(
                    "h-1.5 cursor-pointer rounded-full transition-all",
                    index === safeIndex
                      ? "w-6 bg-gold"
                      : "w-1.5 bg-white/55 hover:bg-white/80",
                  )}
                  aria-label={t("imageDot", { alt, index: index + 1 })}
                  aria-current={index === safeIndex}
                />
              ))}
            </div>
          </>
        ) : null}
      </div>

      {hasMultiple ? (
        <div
          className={cn(
            "grid gap-2",
            gallery.length >= 4 ? "grid-cols-4" : `grid-cols-${gallery.length}`,
          )}
          style={{
            gridTemplateColumns: `repeat(${gallery.length}, minmax(0, 1fr))`,
          }}
        >
          {gallery.map((image, index) => (
            <button
              key={image}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={cn(
                "relative aspect-video cursor-pointer overflow-hidden rounded-lg border-2 transition-all",
                index === safeIndex
                  ? "border-gold opacity-100 ring-1 ring-gold/30"
                  : "border-transparent opacity-80 hover:border-gold/35 hover:opacity-100",
              )}
              aria-label={t("thumbnail", { alt, index: index + 1 })}
              aria-current={index === safeIndex}
            >
              <Image src={image} alt="" fill sizes="96px" className="object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
