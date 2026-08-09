import * as React from "react";

import { bookingFormControlClass } from "@/features/booking/components/booking-form-styles";
import { cn } from "@/lib/utils";

export type BookingInputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const BookingInput = React.forwardRef<HTMLInputElement, BookingInputProps>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={cn(bookingFormControlClass, className)}
      ref={ref}
      {...props}
    />
  ),
);
BookingInput.displayName = "BookingInput";
