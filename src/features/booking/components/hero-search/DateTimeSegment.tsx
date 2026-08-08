"use client";

import { CalendarDays } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DateTimePickerPanel } from "@/features/booking/components/DateTimePickerPanel";
import {
  SearchSegmentShell,
  SegmentValue,
} from "@/features/booking/components/hero-search/SearchSegment";
import { formatDateTimeLabel } from "@/features/booking/lib/search-datetime";
import { cn } from "@/lib/utils";

type DateTimeSegmentProps = {
  label: string;
  dateValue: string;
  timeValue: string;
  minDate: string;
  onDateChange: (value: string) => void;
  onTimeChange: (value: string) => void;
  className?: string;
  withDivider?: boolean;
};

export function DateTimeSegment({
  label,
  dateValue,
  timeValue,
  minDate,
  onDateChange,
  onTimeChange,
  className,
  withDivider = true,
}: DateTimeSegmentProps) {
  const locale = useLocale();
  const t = useTranslations("booking.search");
  const [open, setOpen] = useState(false);
  const hasValue = Boolean(dateValue && timeValue);
  const displayValue = formatDateTimeLabel(dateValue, timeValue, locale);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={label}
          className={cn(
            "cursor-pointer text-start outline-none transition-colors",
            "hover:bg-muted/60 focus-visible:bg-muted/60",
            "rounded-2xl lg:rounded-xl",
            className,
          )}
        >
          <SearchSegmentShell
            icon={CalendarDays}
            label={label}
            withDivider={withDivider}
          >
            <SegmentValue placeholder={!hasValue}>
              {hasValue ? displayValue : t("selectDateTime")}
            </SegmentValue>
          </SearchSegmentShell>
        </button>
      </PopoverTrigger>

      <PopoverContent
        side="top"
        align="start"
        className="w-auto overflow-hidden rounded-2xl border-border/70 p-0 shadow-premium"
      >
        <DateTimePickerPanel
          dateValue={dateValue}
          timeValue={timeValue}
          minDate={minDate}
          onCommit={(date, time) => {
            onDateChange(date);
            onTimeChange(time);
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
