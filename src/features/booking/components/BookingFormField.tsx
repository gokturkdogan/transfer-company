import type { ReactNode } from "react";

import { BookingFieldLabel } from "@/features/booking/components/BookingFieldLabel";
import {
  bookingFormFieldGroupClass,
} from "@/features/booking/components/booking-form-styles";
import { cn } from "@/lib/utils";

type BookingFormFieldProps = {
  label: string;
  htmlFor?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
};

export function BookingFormField({
  label,
  htmlFor,
  required = false,
  children,
  className,
}: BookingFormFieldProps) {
  return (
    <div className={cn(bookingFormFieldGroupClass, className)}>
      <BookingFieldLabel label={label} htmlFor={htmlFor} required={required} />
      {children}
    </div>
  );
}
