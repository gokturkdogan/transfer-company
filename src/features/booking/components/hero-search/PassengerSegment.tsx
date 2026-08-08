"use client";

import { Minus, Plus, Users } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  SearchSegmentShell,
  SegmentValue,
} from "@/features/booking/components/hero-search/SearchSegment";
import { cn } from "@/lib/utils";

type PassengerSegmentProps = {
  adults: number;
  childCount: number;
  largeLuggage: number;
  cabinLuggage: number;
  onAdultsChange: (value: number) => void;
  onChildrenChange: (value: number) => void;
  onLargeLuggageChange: (value: number) => void;
  onCabinLuggageChange: (value: number) => void;
  className?: string;
  withDivider?: boolean;
};

/**
 * Collapses four counters into a single segment so the search bar can stay on
 * one row. Trigger shows a short summary; details live in the popover.
 */
export function PassengerSegment({
  adults,
  childCount,
  largeLuggage,
  cabinLuggage,
  onAdultsChange,
  onChildrenChange,
  onLargeLuggageChange,
  onCabinLuggageChange,
  className,
  withDivider = true,
}: PassengerSegmentProps) {
  const t = useTranslations("booking.search");
  const [open, setOpen] = useState(false);

  const summary = [
    t("adultsShort", { count: adults }),
    childCount > 0 ? t("childrenShort", { count: childCount }) : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={t("passengers")}
          className={cn(
            "cursor-pointer rounded-2xl text-start outline-none transition-colors",
            "hover:bg-muted/60 focus-visible:bg-muted/60 lg:rounded-xl",
            className,
          )}
        >
          <SearchSegmentShell
            icon={Users}
            label={t("passengers")}
            withDivider={withDivider}
          >
            <SegmentValue>{summary}</SegmentValue>
          </SearchSegmentShell>
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-[min(20rem,calc(100vw-2rem))] rounded-2xl border-border/70 p-2 shadow-premium"
      >
        <div className="divide-y divide-border/70">
          <CounterRow
            label={t("adults")}
            value={adults}
            min={1}
            max={50}
            onChange={onAdultsChange}
          />
          <CounterRow
            label={t("children")}
            value={childCount}
            max={50}
            onChange={onChildrenChange}
          />
          <CounterRow
            label={t("largeLuggage")}
            value={largeLuggage}
            max={50}
            onChange={onLargeLuggageChange}
          />
          <CounterRow
            label={t("cabinLuggage")}
            value={cabinLuggage}
            max={50}
            onChange={onCabinLuggageChange}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}

function CounterRow({
  label,
  value,
  min = 0,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min?: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 px-2 py-2.5">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <div className="flex items-center gap-1.5">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-8 w-8 cursor-pointer rounded-lg"
          aria-label={`${label} -`}
          disabled={value <= min}
          onClick={() => onChange(Math.max(min, value - 1))}
        >
          <Minus className="h-3.5 w-3.5" />
        </Button>
        <span className="min-w-6 text-center text-sm font-semibold tabular-nums">
          {value}
        </span>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-8 w-8 cursor-pointer rounded-lg"
          aria-label={`${label} +`}
          disabled={value >= max}
          onClick={() => onChange(Math.min(max, value + 1))}
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
