"use client";

import { Minus, Plus, Users } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  SearchSegmentShell,
  SegmentValue,
} from "@/features/booking/components/hero-search/SearchSegment";
import { searchEditSheetPopoverClass } from "@/features/booking/components/hero-search/search-overlay-styles";
import {
  goldPickerPanelClassName,
  goldPickerPopoverClassName,
  passengerPickerBodyClassName,
  passengerPickerCounterBtnClassName,
  passengerPickerLabelClassName,
  passengerPickerRowClassName,
  passengerPickerValueClassName,
} from "@/features/booking/components/picker-panel-styles";
import { cn } from "@/lib/utils";

type PassengerSegmentProps = {
  adults: number;
  childCount: number;
  infantCount: number;
  onAdultsChange: (value: number) => void;
  onChildrenChange: (value: number) => void;
  onInfantsChange: (value: number) => void;
  className?: string;
  withDivider?: boolean;
  embedded?: boolean;
};

/**
 * Collapses passenger counters into a single segment so the search bar can stay
 * on one row. Luggage is collected in later booking steps.
 */
export function PassengerSegment({
  adults,
  childCount,
  infantCount,
  onAdultsChange,
  onChildrenChange,
  onInfantsChange,
  className,
  withDivider = true,
  embedded = false,
}: PassengerSegmentProps) {
  const t = useTranslations("booking.search");
  const [open, setOpen] = useState(false);

  const summary = [
    t("adultsShort", { count: adults }),
    childCount > 0 ? t("childrenShort", { count: childCount }) : null,
    infantCount > 0 ? t("infantsShort", { count: infantCount }) : null,
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
            embedded={embedded}
            withDivider={withDivider}
          >
            <SegmentValue>{summary}</SegmentValue>
          </SearchSegmentShell>
        </button>
      </PopoverTrigger>
      <PopoverContent
        side={embedded ? "bottom" : "top"}
        align={embedded ? "center" : "end"}
        className={cn(
          goldPickerPopoverClassName,
          "w-[min(20rem,calc(100vw-2rem))]",
          embedded && searchEditSheetPopoverClass,
        )}
      >
        <div className={cn(goldPickerPanelClassName, passengerPickerBodyClassName)}>
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
            label={t("infants")}
            value={infantCount}
            max={50}
            onChange={onInfantsChange}
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
    <div className={passengerPickerRowClassName}>
      <span className={passengerPickerLabelClassName}>{label}</span>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          className={passengerPickerCounterBtnClassName}
          aria-label={`${label} -`}
          disabled={value <= min}
          onClick={() => onChange(Math.max(min, value - 1))}
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
        <span className={passengerPickerValueClassName}>{value}</span>
        <button
          type="button"
          className={passengerPickerCounterBtnClassName}
          aria-label={`${label} +`}
          disabled={value >= max}
          onClick={() => onChange(Math.min(max, value + 1))}
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
