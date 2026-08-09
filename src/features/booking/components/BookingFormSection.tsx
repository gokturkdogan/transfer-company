import type { ReactNode } from "react";

import {
  bookingFormSectionHeaderClass,
  bookingFormSectionIconClass,
  bookingFormSectionSubtitleClass,
  bookingFormSectionTitleClass,
} from "@/features/booking/components/booking-form-styles";
import { cn } from "@/lib/utils";

type BookingFormSectionProps = {
  title: string;
  description?: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function BookingFormSection({
  title,
  description,
  icon,
  children,
  className,
}: BookingFormSectionProps) {
  return (
    <section className={cn("rounded-[1.15rem]", className)}>
      <header
        className={cn(
          bookingFormSectionHeaderClass,
          "mb-3",
          description && "items-start",
        )}
      >
        {icon ? (
          <span className={bookingFormSectionIconClass}>{icon}</span>
        ) : null}
        <div className="min-w-0 space-y-1">
          <h3 className={bookingFormSectionTitleClass}>{title}</h3>
          {description ? (
            <p className={bookingFormSectionSubtitleClass}>{description}</p>
          ) : null}
        </div>
      </header>
      {children}
    </section>
  );
}
