import { Label } from "@/components/ui/label";
import { bookingFormLabelClass } from "@/features/booking/components/booking-form-styles";
import { cn } from "@/lib/utils";

type BookingFieldLabelProps = {
  label: string;
  htmlFor?: string;
  required?: boolean;
  className?: string;
};

export function BookingFieldLabel({
  label,
  htmlFor,
  required = false,
  className,
}: BookingFieldLabelProps) {
  return (
    <Label htmlFor={htmlFor} className={cn(bookingFormLabelClass, className)}>
      {label}
      {required ? " *" : null}
    </Label>
  );
}
