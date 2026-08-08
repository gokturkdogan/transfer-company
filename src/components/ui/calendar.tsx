"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  DayPicker,
  type DayPickerProps,
  type PreviousMonthButtonProps,
  type NextMonthButtonProps,
} from "react-day-picker";

import { cn } from "@/lib/utils";

import "react-day-picker/style.css";

export type CalendarProps = DayPickerProps;

const navButtonClassName = cn(
  "inline-flex h-auto w-auto shrink-0 cursor-pointer items-center justify-center",
  "border-0 bg-transparent p-0 text-gold-deep shadow-none outline-none",
  "transition-colors duration-200",
  "hover:bg-transparent hover:text-gold",
  "focus:outline-none focus-visible:outline-none focus-visible:ring-0",
  "disabled:cursor-not-allowed disabled:opacity-30",
);

function PremiumPreviousMonthButton({
  className,
  children: _children,
  ...props
}: PreviousMonthButtonProps) {
  return (
    <button type="button" className={cn(navButtonClassName, className)} {...props}>
      <ChevronLeft className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
    </button>
  );
}

function PremiumNextMonthButton({
  className,
  children: _children,
  ...props
}: NextMonthButtonProps) {
  return (
    <button type="button" className={cn(navButtonClassName, className)} {...props}>
      <ChevronRight className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
    </button>
  );
}

export function Calendar({ className, classNames, ...props }: CalendarProps) {
  return (
    <DayPicker
      navLayout="around"
      showOutsideDays
      className={cn("datetime-picker-calendar w-fit px-0.5 py-1", className)}
      classNames={{
        root: "rdp-root w-fit",
        months: "rdp-months relative flex w-fit flex-col",
        month: "rdp-month relative w-fit space-y-1",
        month_caption: "rdp-month_caption flex h-8 items-center justify-center",
        caption_label:
          "rdp-caption_label text-xs font-semibold tracking-wide text-foreground",
        button_previous: "rdp-button_previous",
        button_next: "rdp-button_next",
        month_grid: "rdp-month_grid w-fit border-collapse",
        weekdays: "rdp-weekdays",
        weekday:
          "rdp-weekday text-[9px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/80",
        weeks: "rdp-weeks",
        week: "rdp-week",
        day: "rdp-day p-0 text-center",
        day_button: cn(
          "rdp-day_button mx-auto flex h-7 w-7 items-center justify-center rounded-md",
          "border-0 text-foreground/90 transition-colors duration-200",
          "hover:bg-gold/10 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold/35",
        ),
        selected: "rdp-selected",
        today: "rdp-today",
        outside: "rdp-outside",
        disabled: "rdp-disabled",
        ...classNames,
      }}
      components={{
        PreviousMonthButton: PremiumPreviousMonthButton,
        NextMonthButton: PremiumNextMonthButton,
      }}
      {...props}
    />
  );
}
