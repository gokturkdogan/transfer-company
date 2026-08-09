import { Children, Fragment, type ReactNode } from "react";

import {
  bookingFormSectionDividerClass,
  bookingFormSectionsClass,
} from "@/features/booking/components/booking-form-styles";
import { cn } from "@/lib/utils";

type BookingFormSectionsProps = {
  children: ReactNode;
  className?: string;
};

export function BookingFormSections({
  children,
  className,
}: BookingFormSectionsProps) {
  const sections = Children.toArray(children).filter(Boolean);

  return (
    <div className={cn(bookingFormSectionsClass, className)}>
      {sections.map((section, index) => (
        <Fragment key={index}>
          {index > 0 ? (
            <hr className={cn(bookingFormSectionDividerClass, "my-8")} />
          ) : null}
          {section}
        </Fragment>
      ))}
    </div>
  );
}
