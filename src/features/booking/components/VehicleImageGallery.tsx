"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState, type MouseEvent } from "react";

import { MAX_VEHICLE_BOOKING_PREVIEW_IMAGES } from "@/features/vehicles/domain/constants";
import { cn } from "@/lib/utils";

type VehicleImageGalleryProps = {
  coverImage: string;
  previewImages: string[];
  alt: string;
  className?: string;
};

/** [main, thumb1, thumb2, thumb3, thumb4] — kapak + 4 panel fotoğrafı */
function buildImageSlots(coverImage: string, previewImages: string[]): string[] {
  const cover = coverImage.trim();
  const thumbs = uniqueImages(previewImages)
    .filter((image) => image !== cover)
    .slice(0, MAX_VEHICLE_BOOKING_PREVIEW_IMAGES);

  if (!cover && thumbs.length === 0) {
    return [];
  }

  if (!cover) {
    return [thumbs[0] ?? "", ...thumbs.slice(1)];
  }

  return [cover, ...thumbs];
}

function uniqueImages(images: string[]): string[] {
  return images
    .map((image) => image.trim())
    .filter((image, index, all) => image.length > 0 && all.indexOf(image) === index);
}

export function VehicleImageGallery({
  coverImage,
  previewImages,
  alt,
  className,
}: VehicleImageGalleryProps) {
  const t = useTranslations("home.carousel");

  const gallerySignature = useMemo(
    () => `${coverImage.trim()}|${previewImages.map((image) => image.trim()).join("|")}`,
    [coverImage, previewImages],
  );

  const [slots, setSlots] = useState<string[]>(() =>
    buildImageSlots(coverImage, previewImages),
  );

  // Yalnızca araç/foto seti değiştiğinde sıfırla — parent re-render swap'ı bozmasın.
  useEffect(() => {
    setSlots(buildImageSlots(coverImage, previewImages));
  }, [gallerySignature]);

  const mainImage = slots[0] ?? "";
  const thumbImages = slots.slice(1);
  const hasThumbs = thumbImages.length > 0;
  const hasMultiple = Boolean(mainImage) && thumbImages.length > 0;

  const swapWithThumb = (index: number, event?: MouseEvent<HTMLButtonElement>) => {
    event?.stopPropagation();
    event?.preventDefault();

    const thumbSlotIndex = index + 1;

    setSlots((current) => {
      if (current.length <= thumbSlotIndex || !current[thumbSlotIndex]) {
        return current;
      }

      const next = [...current];
      const previousMain = next[0];
      next[0] = next[thumbSlotIndex]!;
      next[thumbSlotIndex] = previousMain;
      return next;
    });
  };

  const showPrevious = () => {
    if (!hasMultiple) {
      return;
    }

    const currentThumbIndex = thumbImages.indexOf(mainImage);
    const targetIndex =
      currentThumbIndex === -1
        ? thumbImages.length - 1
        : currentThumbIndex === 0
          ? thumbImages.length - 1
          : currentThumbIndex - 1;

    swapWithThumb(targetIndex);
  };

  const showNext = () => {
    if (!hasMultiple) {
      return;
    }

    const currentThumbIndex = thumbImages.indexOf(mainImage);
    const targetIndex =
      currentThumbIndex === -1
        ? 0
        : currentThumbIndex === thumbImages.length - 1
          ? 0
          : currentThumbIndex + 1;

    swapWithThumb(targetIndex);
  };

  if (!mainImage) {
    return null;
  }

  return (
    <div className={cn("flex w-full flex-col gap-2", className)}>
      <div className="group relative aspect-video w-full overflow-hidden rounded-xl bg-muted">
        <Image
          key={`main-${mainImage}`}
          src={mainImage}
          alt={alt}
          fill
          sizes="(max-width: 1024px) 100vw, 320px"
          className="object-cover transition-opacity duration-300"
          priority
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/45 via-transparent to-transparent"
        />

        {hasMultiple ? (
          <>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                showPrevious();
              }}
              className="absolute start-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-ink/70 text-white shadow-lg backdrop-blur-sm transition-opacity hover:bg-ink/85 md:opacity-0 md:group-hover:opacity-100"
              aria-label={t("previousImage", { alt })}
            >
              <ChevronLeft className="h-4 w-4 rtl:rotate-180" aria-hidden />
            </button>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                showNext();
              }}
              className="absolute end-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-ink/70 text-white shadow-lg backdrop-blur-sm transition-opacity hover:bg-ink/85 md:opacity-0 md:group-hover:opacity-100"
              aria-label={t("nextImage", { alt })}
            >
              <ChevronRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
            </button>
          </>
        ) : null}
      </div>

      {hasThumbs ? (
        <div className="grid grid-cols-4 gap-2">
          {thumbImages.map((image, index) => (
            <button
              key={`thumb-slot-${index}`}
              type="button"
              onClick={(event) => swapWithThumb(index, event)}
              className={cn(
                "relative aspect-video cursor-pointer overflow-hidden rounded-lg border-2 transition-all",
                "border-transparent opacity-90 hover:border-gold/45 hover:opacity-100",
              )}
              aria-label={t("thumbnail", { alt, index: index + 1 })}
            >
              <Image
                key={image}
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
