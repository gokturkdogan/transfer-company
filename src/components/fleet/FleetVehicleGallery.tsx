"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

import { cn } from "@/lib/utils";

type FleetVehicleGalleryProps = {
  images: string[];
  alt: string;
  className?: string;
  compact?: boolean;
};

export function FleetVehicleGallery({
  images,
  alt,
  className,
  compact = false,
}: FleetVehicleGalleryProps) {
  const gallery = useMemo(
    () =>
      images
        .map((image) => image.trim())
        .filter((image, index, all) => image.length > 0 && all.indexOf(image) === index),
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

  if (gallery.length === 0 || !activeImage) {
    return null;
  }

  return (
    <div className={cn("flex w-full flex-col gap-3", className)}>
      <div
        className={cn(
          "group relative w-full overflow-hidden rounded-[1.75rem] border border-gold/25 bg-muted shadow-premium",
          compact ? "aspect-[4/3] max-h-[19rem]" : "aspect-[4/3] sm:aspect-[16/11]",
        )}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 z-20 rounded-[1.75rem] ring-1 ring-inset ring-white/10"
        />
        <Image
          key={activeImage}
          src={activeImage}
          alt={alt}
          fill
          priority
          sizes={compact ? "(max-width: 1024px) 100vw, 38vw" : "(max-width: 1024px) 100vw, 60vw"}
          className="object-cover transition-opacity duration-300"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/50 via-transparent to-transparent"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 futuristic-grid opacity-20 [mask-image:linear-gradient(to_bottom,transparent,black_35%,transparent)]"
        />

        {hasMultiple ? (
          <>
            <button
              type="button"
              onClick={() =>
                setActiveIndex((current) =>
                  current === 0 ? gallery.length - 1 : current - 1,
                )
              }
              className="absolute start-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-ink/70 text-white shadow-lg backdrop-blur-sm transition-opacity hover:bg-ink/85 md:opacity-0 md:group-hover:opacity-100"
              aria-label={`${alt} — previous`}
            >
              <ChevronLeft className="h-5 w-5 rtl:rotate-180" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() =>
                setActiveIndex((current) =>
                  current === gallery.length - 1 ? 0 : current + 1,
                )
              }
              className="absolute end-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-ink/70 text-white shadow-lg backdrop-blur-sm transition-opacity hover:bg-ink/85 md:opacity-0 md:group-hover:opacity-100"
              aria-label={`${alt} — next`}
            >
              <ChevronRight className="h-5 w-5 rtl:rotate-180" aria-hidden />
            </button>
            <div className="absolute bottom-3 start-1/2 z-10 flex -translate-x-1/2 gap-1.5">
              {gallery.map((image, index) => (
                <button
                  key={image}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    index === safeIndex
                      ? "w-6 bg-gold"
                      : "w-1.5 bg-white/50 hover:bg-white/80",
                  )}
                  aria-label={`${alt} — image ${index + 1}`}
                />
              ))}
            </div>
          </>
        ) : null}
      </div>

      {hasMultiple ? (
        <div className="flex flex-wrap gap-2">
          {gallery.map((image, index) => (
            <button
              key={image}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={cn(
                "relative shrink-0 overflow-hidden rounded-xl border transition-all",
                compact ? "h-12 w-16" : "h-[4.5rem] w-28",
                index === safeIndex
                  ? "border-gold shadow-gold"
                  : "border-border/70 opacity-75 hover:opacity-100",
              )}
              aria-label={`${alt} — thumbnail ${index + 1}`}
            >
              <Image
                src={image}
                alt=""
                fill
                sizes="96px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
