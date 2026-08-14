import { cn } from "@/lib/utils";

/** Popover shell — gradient lives on `.gold-picker-panel` inside. */
export const goldPickerPopoverClassName = cn(
  "gold-picker-popover",
  "overflow-hidden rounded-2xl border border-gold/35 bg-transparent p-0 shadow-premium",
);

export const goldPickerPanelClassName = "gold-picker-panel";

export const passengerPickerBodyClassName = "passenger-picker-body";

export const passengerPickerRowClassName = cn(
  "passenger-picker-row",
  "flex items-center justify-between gap-3",
  "rounded-xl border border-transparent border-l-[3px] border-l-transparent",
  "px-2.5 py-2.5",
  "transition-[transform,background,border-color,box-shadow] duration-200 ease-out",
);

export const passengerPickerLabelClassName =
  "passenger-picker-row-label text-sm font-medium";

export const passengerPickerValueClassName =
  "passenger-picker-value min-w-6 text-center text-sm font-semibold tabular-nums";

export const passengerPickerCounterBtnClassName = cn(
  "passenger-picker-counter-btn",
  "inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border shadow-none",
  "outline-none focus-visible:ring-2 focus-visible:ring-gold-bright/50",
  "disabled:cursor-not-allowed",
);
