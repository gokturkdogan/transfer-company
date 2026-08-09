"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  Children,
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import { cn } from "@/lib/utils";

type PremiumCarouselProps = {
  children: ReactNode;
  /** Accessible name for the carousel region */
  label: string;
  className?: string;
};

const LG_BREAKPOINT = 1024;

function getItemsPerView(width: number) {
  return width >= LG_BREAKPOINT ? 3 : 1;
}

function subscribeToViewport(callback: () => void) {
  window.addEventListener("resize", callback);
  return () => window.removeEventListener("resize", callback);
}

function getViewportItemsPerView() {
  return getItemsPerView(window.innerWidth);
}

function useItemsPerView() {
  return useSyncExternalStore(
    subscribeToViewport,
    getViewportItemsPerView,
    () => 1,
  );
}

export function PremiumCarousel({
  children,
  label,
  className,
}: PremiumCarouselProps) {
  const t = useTranslations("home.carousel");
  const trackRef = useRef<HTMLDivElement>(null);
  const slides = Children.toArray(children);
  const slideCount = slides.length;

  const [activeIndex, setActiveIndex] = useState(0);
  const itemsPerView = useItemsPerView();

  const maxIndex = Math.max(0, slideCount - itemsPerView);
  const currentIndex = Math.min(activeIndex, maxIndex);
  const canScrollPrev = currentIndex > 0;
  const canScrollNext = currentIndex < maxIndex;

  const scrollToIndex = useCallback((index: number) => {
    const track = trackRef.current;
    if (!track || slideCount === 0) {
      return;
    }

    const clamped = Math.max(0, Math.min(index, slideCount - 1));
    const slide = track.children.item(clamped) as HTMLElement | null;

    if (slide) {
      track.scrollTo({
        left: slide.offsetLeft,
        behavior: "smooth",
      });
    }
  }, [slideCount]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) {
      return;
    }

    const onScroll = () => {
      const slideElements = Array.from(track.children) as HTMLElement[];
      if (slideElements.length === 0) {
        return;
      }

      const scrollLeft = track.scrollLeft;
      let closest = 0;
      let minDistance = Number.POSITIVE_INFINITY;

      for (let index = 0; index < slideElements.length; index++) {
        const distance = Math.abs(slideElements[index]!.offsetLeft - scrollLeft);
        if (distance < minDistance) {
          minDistance = distance;
          closest = index;
        }
      }

      setActiveIndex(closest);
    };

    track.addEventListener("scroll", onScroll, { passive: true });
    return () => track.removeEventListener("scroll", onScroll);
  }, [slideCount]);

  if (slideCount === 0) {
    return null;
  }

  const showDesktopNav = slideCount > itemsPerView;

  const navButtonClass = cn(
    "flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center rounded-full",
    "bg-gold-gradient text-ink shadow-gold",
    "border border-gold-deep/35",
    "transition-all duration-300 hover:brightness-110 hover:shadow-premium",
    "disabled:cursor-not-allowed disabled:border-gold/20 disabled:opacity-40 disabled:shadow-none",
  );

  return (
    <div className={cn("relative", className)}>
      <div className="lg:flex lg:items-center lg:gap-4">
        {showDesktopNav && (
          <button
            type="button"
            aria-label={t("prev")}
            disabled={!canScrollPrev}
            onClick={() => scrollToIndex(currentIndex - 1)}
            className={cn(navButtonClass, "hidden lg:flex")}
          >
            <ChevronLeft className="h-5 w-5 rtl:rotate-180" aria-hidden />
          </button>
        )}

        <div
          ref={trackRef}
          role="region"
          aria-roledescription={t("carouselRole")}
          aria-label={label}
          className={cn(
            "min-w-0 flex-1",
            "flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-1",
            "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
            "lg:gap-5",
          )}
        >
          {slides.map((slide, index) => (
            <div
              key={index}
              role="group"
              aria-roledescription={t("slideRole")}
              aria-label={t("slideOf", {
                current: index + 1,
                total: slideCount,
              })}
              className={cn(
                "h-full shrink-0 snap-start",
                "w-full lg:w-[calc((100%-2.5rem)/3)]",
              )}
            >
              {slide}
            </div>
          ))}
        </div>

        {showDesktopNav && (
          <button
            type="button"
            aria-label={t("next")}
            disabled={!canScrollNext}
            onClick={() => scrollToIndex(currentIndex + 1)}
            className={cn(navButtonClass, "hidden lg:flex")}
          >
            <ChevronRight className="h-5 w-5 rtl:rotate-180" aria-hidden />
          </button>
        )}
      </div>

      {/* Mobile bullets */}
      {slideCount > 1 && (
        <div
          className="mt-5 flex items-center justify-center gap-2 lg:hidden"
          role="tablist"
          aria-label={label}
        >
          {slides.map((_, index) => {
            const isActive = index === currentIndex;

            return (
              <button
                key={index}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-label={t("goToSlide", { index: index + 1 })}
                onClick={() => scrollToIndex(index)}
                className={cn(
                  "cursor-pointer rounded-full transition-all duration-300",
                  isActive
                    ? "h-2 w-7 bg-gold shadow-gold"
                    : "h-2 w-2 bg-border hover:bg-gold/40",
                )}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
