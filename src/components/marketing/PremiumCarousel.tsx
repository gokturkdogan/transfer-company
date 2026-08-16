"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  Children,
  useCallback,
  useEffect,
  useLayoutEffect,
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
  /** Infinite loop — clones slides; rewinds off-screen after scroll settles */
  loop?: boolean;
};

const LG_BREAKPOINT = 1024;
const SCROLL_END_FALLBACK_MS = 120;

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

function findClosestSlideIndex(
  slideElements: HTMLElement[],
  scrollLeft: number,
): number {
  let closest = 0;
  let minDistance = Number.POSITIVE_INFINITY;

  for (let index = 0; index < slideElements.length; index++) {
    const distance = Math.abs(slideElements[index]!.offsetLeft - scrollLeft);
    if (distance < minDistance) {
      minDistance = distance;
      closest = index;
    }
  }

  return closest;
}

export function PremiumCarousel({
  children,
  label,
  className,
  loop = false,
}: PremiumCarouselProps) {
  const t = useTranslations("home.carousel");
  const trackRef = useRef<HTMLDivElement>(null);
  const isTeleportingRef = useRef(false);
  const slides = Children.toArray(children);
  const slideCount = slides.length;
  const loopEnabled = loop && slideCount > 1;
  const displaySlides = loopEnabled
    ? [...slides, ...slides, ...slides]
    : slides;
  const displayCount = displaySlides.length;

  const [activeIndex, setActiveIndex] = useState(0);
  const itemsPerView = useItemsPerView();

  const maxIndex = Math.max(0, slideCount - itemsPerView);
  const currentIndex = loopEnabled
    ? activeIndex
    : Math.min(activeIndex, maxIndex);
  const logicalIndex =
    loopEnabled && slideCount > 0 ? currentIndex % slideCount : currentIndex;
  const canScrollPrev = loopEnabled ? true : currentIndex > 0;
  const canScrollNext = loopEnabled ? true : currentIndex < maxIndex;

  const jumpToIndex = useCallback(
    (index: number) => {
      const track = trackRef.current;
      if (!track || slideCount === 0) {
        return;
      }

      const targetIndex = Math.max(0, Math.min(index, displayCount - 1));
      const slide = track.children.item(targetIndex) as HTMLElement | null;

      if (!slide) {
        return;
      }

      isTeleportingRef.current = true;
      track.style.scrollSnapType = "none";
      track.scrollLeft = slide.offsetLeft;
      setActiveIndex(targetIndex);

      requestAnimationFrame(() => {
        track.style.scrollSnapType = "";
        requestAnimationFrame(() => {
          isTeleportingRef.current = false;
        });
      });
    },
    [displayCount, slideCount],
  );

  const scrollToIndex = useCallback(
    (index: number) => {
      const track = trackRef.current;
      if (!track || slideCount === 0) {
        return;
      }

      const upperBound = loopEnabled ? displayCount - 1 : slideCount - 1;
      const targetIndex = Math.max(0, Math.min(index, upperBound));
      const slide = track.children.item(targetIndex) as HTMLElement | null;

      if (slide) {
        track.scrollTo({
          left: slide.offsetLeft,
          behavior: "smooth",
        });
      }
    },
    [displayCount, loopEnabled, slideCount],
  );

  const reconcileLoopPosition = useCallback(() => {
    if (!loopEnabled || isTeleportingRef.current) {
      return;
    }

    const track = trackRef.current;
    if (!track) {
      return;
    }

    const slideElements = Array.from(track.children) as HTMLElement[];
    if (slideElements.length === 0) {
      return;
    }

    const closest = findClosestSlideIndex(slideElements, track.scrollLeft);

    if (closest >= 2 * slideCount) {
      jumpToIndex(closest - slideCount);
      return;
    }

    if (closest < slideCount) {
      jumpToIndex(closest + slideCount);
    }
  }, [jumpToIndex, loopEnabled, slideCount]);

  useLayoutEffect(() => {
    if (!loopEnabled) {
      return;
    }

    jumpToIndex(slideCount);
  }, [jumpToIndex, loopEnabled, slideCount]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) {
      return;
    }

    let scrollEndTimer: ReturnType<typeof setTimeout> | undefined;

    const onScroll = () => {
      if (isTeleportingRef.current) {
        return;
      }

      const slideElements = Array.from(track.children) as HTMLElement[];
      if (slideElements.length === 0) {
        return;
      }

      const closest = findClosestSlideIndex(slideElements, track.scrollLeft);
      setActiveIndex(closest);
    };

    const onScrollSettled = () => {
      onScroll();
      reconcileLoopPosition();
    };

    const onScrollWithFallback = () => {
      onScroll();
      clearTimeout(scrollEndTimer);
      scrollEndTimer = setTimeout(onScrollSettled, SCROLL_END_FALLBACK_MS);
    };

    track.addEventListener("scroll", onScrollWithFallback, { passive: true });
    track.addEventListener("scrollend", onScrollSettled);

    return () => {
      clearTimeout(scrollEndTimer);
      track.removeEventListener("scroll", onScrollWithFallback);
      track.removeEventListener("scrollend", onScrollSettled);
    };
  }, [displayCount, reconcileLoopPosition, slideCount]);

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
            "flex snap-x snap-mandatory gap-4 overflow-x-auto pb-1",
            !loopEnabled && "scroll-smooth",
            "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
            "lg:gap-5",
          )}
        >
          {displaySlides.map((slide, index) => (
            <div
              key={index}
              role="group"
              aria-roledescription={t("slideRole")}
              aria-label={t("slideOf", {
                current: (index % slideCount) + 1,
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
            const isActive = index === logicalIndex;

            return (
              <button
                key={index}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-label={t("goToSlide", { index: index + 1 })}
                onClick={() =>
                  scrollToIndex(loopEnabled ? slideCount + index : index)
                }
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
