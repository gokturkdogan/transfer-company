"use client";

import { CalendarDays } from "lucide-react";
import { useId } from "react";

import { SearchSegmentShell } from "@/features/booking/components/hero-search/SearchSegment";
import { cn } from "@/lib/utils";

type DateTimeSegmentProps = {
  label: string;
  dateLabel: string;
  timeLabel: string;
  dateValue: string;
  timeValue: string;
  minDate: string;
  onDateChange: (value: string) => void;
  onTimeChange: (value: string) => void;
  className?: string;
  withDivider?: boolean;
};

/**
 * Native date + time inputs rendered inline so the whole picker stays on one
 * row. Native controls keep mobile UX (system pickers) and RTL support intact.
 */
export function DateTimeSegment({
  label,
  dateLabel,
  timeLabel,
  dateValue,
  timeValue,
  minDate,
  onDateChange,
  onTimeChange,
  className,
  withDivider = true,
}: DateTimeSegmentProps) {
  const dateId = useId();
  const timeId = useId();

  const inputClasses =
    "min-w-0 cursor-pointer appearance-none border-0 bg-transparent p-0 text-sm font-semibold leading-tight text-foreground outline-none focus:outline-none";

  return (
    <div
      className={cn(
        "rounded-2xl transition-colors hover:bg-muted/60 lg:rounded-xl",
        className,
      )}
    >
      <SearchSegmentShell
        icon={CalendarDays}
        label={label}
        withDivider={withDivider}
      >
        <span className="flex min-w-0 items-baseline gap-1.5">
          <input
            id={dateId}
            type="date"
            aria-label={dateLabel}
            value={dateValue}
            min={minDate}
            onChange={(event) => onDateChange(event.target.value)}
            className={cn(inputClasses, "w-[7.5rem] flex-1")}
          />
          <span className="text-border" aria-hidden>
            |
          </span>
          <input
            id={timeId}
            type="time"
            aria-label={timeLabel}
            value={timeValue}
            onChange={(event) => onTimeChange(event.target.value)}
            className={cn(inputClasses, "w-[4.25rem] shrink-0")}
          />
        </span>
      </SearchSegmentShell>
    </div>
  );
}
