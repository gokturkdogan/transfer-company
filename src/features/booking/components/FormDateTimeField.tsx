"use client";

import { CalendarDays } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DateTimePickerPanel } from "@/features/booking/components/DateTimePickerPanel";
import { BookingFieldLabel } from "@/features/booking/components/BookingFieldLabel";
import {
  bookingFormFieldGroupClass,
  bookingFormTriggerClass,
} from "@/features/booking/components/booking-form-styles";
import {
  formatDateTimeLabel,
  todayIsoDateInProjectZone,
} from "@/features/booking/lib/search-datetime";
import { cn } from "@/lib/utils";

type FormDateTimeFieldProps = {
  id: string;
  label: string;
  dateValue: string;
  timeValue: string;
  minDate?: string;
  onCommit: (date: string, time: string) => void;
  disabled?: boolean;
  required?: boolean;
  className?: string;
};

export function FormDateTimeField({
  id,
  label,
  dateValue,
  timeValue,
  minDate = todayIsoDateInProjectZone(),
  onCommit,
  disabled = false,
  required = false,
  className,
}: FormDateTimeFieldProps) {
  const locale = useLocale();
  const t = useTranslations("booking.search");
  const [open, setOpen] = useState(false);
  const hasValue = Boolean(dateValue && timeValue);
  const displayValue = hasValue
    ? formatDateTimeLabel(dateValue, timeValue, locale)
    : t("selectDateTime");

  return (
    <div className={cn(bookingFormFieldGroupClass, className)}>
      <BookingFieldLabel label={label} htmlFor={id} required={required} />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            id={id}
            type="button"
            disabled={disabled}
            className={cn(
              bookingFormTriggerClass,
              !hasValue && "text-muted-foreground/65",
            )}
          >
            <CalendarDays
              className="h-4 w-4 shrink-0 text-gold-deep/70"
              aria-hidden
            />
            <span className="truncate">{displayValue}</span>
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-auto overflow-hidden rounded-2xl border-border/70 p-0 shadow-premium"
        >
          <DateTimePickerPanel
            dateValue={dateValue}
            timeValue={timeValue}
            minDate={minDate}
            onCommit={(date, time) => {
              onCommit(date, time);
              setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
