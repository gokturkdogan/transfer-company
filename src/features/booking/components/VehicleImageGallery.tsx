"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";

import { MAX_VEHICLE_BOOKING_PREVIEW_IMAGES } from "@/features/vehicles/domain/constants";
import { cn } from "@/lib/utils";

type VehicleImageGalleryProps = {
  coverImage: string;
  previewImages: string[];
  alt: string;
  className?: string;
};

type GalleryState = {
  mainImage: string;
  thumbImages: string[];
};

function uniqueImages(images: string[]): string[] {
  return images
    .map((image) => image.trim())
    .filter((image, index, all) => image.length > 0 && all.indexOf(image) === index);
}

function buildGalleryState(coverImage: string, previewImages: string[]): GalleryState {
  const mainImage = coverImage.trim();
  const thumbImages = uniqueImages(previewImages).slice(
    0,
    MAX_VEHICLE_BOOKING_PREVIEW_IMAGES,
  );

  return { mainImage, thumbImages };
}

export function VehicleImageGallery({
  coverImage,
  previewImages,
  alt,
  className,
}: VehicleImageGalleryProps) {
  const t = useTranslations("home.carousel");

  const initialState = useMemo(
    () => buildGalleryState(coverImage, previewImages),
    [coverImage, previewImages],
  );
  const gallerySignature = `${coverImage}|${previewImages.join("|")}`;

  const [gallery, setGallery] = useState<GalleryState>(initialState);

  useEffect(() => {
    setGallery(buildGalleryState(coverImage, previewImages));
  }, [gallerySignature, coverImage, previewImages]);

  const { mainImage, thumbImages } = gallery;
  const hasThumbs = thumbImages.length > 0;
  const hasMultiple = Boolean(mainImage) && thumbImages.length > 0;

  const swapWithThumb = (index: number) => {
    const selected = thumbImages[index];

    if (!selected || selected === mainImage) {
      return;
    }

    setGallery((current) => ({
      mainImage: selected,
      thumbImages: current.thumbImages.map((image, thumbIndex) =>
        thumbIndex === index ? current.mainImage : image,
      ),
    }));
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
          key={mainImage}
          src={mainImage}
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
          </>
        ) : null}
      </div>

      {hasThumbs ? (
        <div className="grid grid-cols-4 gap-2">
          {thumbImages.map((image, index) => (
            <button
              key={`${index}-${image}`}
              type="button"
              onClick={() => swapWithThumb(index)}
              className={cn(
                "relative aspect-video cursor-pointer overflow-hidden rounded-lg border-2 transition-all",
                image === mainImage
                  ? "border-gold opacity-100 ring-1 ring-gold/30"
                  : "border-transparent opacity-80 hover:border-gold/35 hover:opacity-100",
              )}
              aria-label={t("thumbnail", { alt, index: index + 1 })}
            >
              <Image src={image} alt="" fill sizes="96px" className="object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
