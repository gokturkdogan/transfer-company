"use client";

import { CalendarDays } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";

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
  const [isMobile, setIsMobile] = useState(false);
  const hasValue = Boolean(dateValue && timeValue);
  const displayValue = formatDateTimeLabel(dateValue, timeValue, locale);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 1023px)");
    const sync = () => setIsMobile(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

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
        side={isMobile ? "bottom" : "top"}
        align={isMobile ? "center" : "start"}
        sideOffset={8}
        collisionPadding={12}
        className={cn(
          "w-auto overflow-hidden rounded-2xl border-border/70 p-0 shadow-premium",
          isMobile && "w-[calc(100vw-1.5rem)] max-w-[22rem]",
        )}
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
