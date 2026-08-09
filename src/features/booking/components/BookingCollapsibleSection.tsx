"use client";

import { ChevronDown } from "lucide-react";
import { useId, useState, type ReactNode } from "react";

import {
  bookingFormSectionHeaderClass,
  bookingFormSectionIconClass,
  bookingFormSectionSubtitleClass,
  bookingFormSectionTitleClass,
} from "@/features/booking/components/booking-form-styles";
import { cn } from "@/lib/utils";

type BookingCollapsibleSectionProps = {
  title: string;
  description?: string;
  icon?: ReactNode;
  defaultOpen?: boolean;
  compact?: boolean;
  children: ReactNode;
  className?: string;
};

export function BookingCollapsibleSection({
  title,
  description,
  icon,
  defaultOpen = false,
  compact = false,
  children,
  className,
}: BookingCollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const contentId = useId();

  return (
    <section className={cn("rounded-[1.15rem]", className)}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={contentId}
        onClick={() => setOpen((current) => !current)}
        className={cn(
          bookingFormSectionHeaderClass,
          "w-full cursor-pointer rounded-lg text-start outline-none transition-colors focus-visible:ring-2 focus-visible:ring-gold/20 focus-visible:ring-offset-0",
          !compact && description && "items-start",
        )}
      >
        {icon ? (
          <span className={bookingFormSectionIconClass}>{icon}</span>
        ) : null}
        {compact ? (
          <>
            <span className={bookingFormSectionTitleClass}>{title}</span>
            <ChevronDown
              className={cn(
                "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300",
                open && "rotate-180",
              )}
              aria-hidden
            />
          </>
        ) : (
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-1.5">
              <span className={bookingFormSectionTitleClass}>{title}</span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300",
                  open && "rotate-180",
                )}
                aria-hidden
              />
            </span>
            {description ? (
              <span className={cn("mt-0.5 block", bookingFormSectionSubtitleClass)}>
                {description}
              </span>
            ) : null}
          </span>
        )}
      </button>

      <div
        id={contentId}
        className={cn(
          "grid transition-[grid-template-rows] duration-300 ease-in-out",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden">
          <div
            className={cn(
              "space-y-3 pt-1 transition-opacity duration-300",
              open
                ? compact
                  ? "mt-3 opacity-100"
                  : "mt-5 opacity-100"
                : "opacity-0",
            )}
          >
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}
