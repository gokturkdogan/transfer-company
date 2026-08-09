import type { ReactNode } from "react";

import { Label } from "@/components/ui/label";
import {
  bookingFormFieldGroupClass,
  bookingFormLabelClass,
} from "@/features/booking/components/booking-form-styles";
import { cn } from "@/lib/utils";

type BookingFormFieldProps = {
  label: string;
  htmlFor?: string;
  children: ReactNode;
  className?: string;
};

export function BookingFormField({
  label,
  htmlFor,
  children,
  className,
}: BookingFormFieldProps) {
  return (
    <div className={cn(bookingFormFieldGroupClass, className)}>
      <Label htmlFor={htmlFor} className={bookingFormLabelClass}>
        {label}
      </Label>
      {children}
    </div>
  );
}
