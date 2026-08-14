import { cn } from "@/lib/utils";

import {
  goldPickerPanelClassName,
  goldPickerPopoverClassName,
} from "@/features/booking/components/picker-panel-styles";

/** Popover shell — gradient lives on `.gold-picker-panel` inside. */
export const locationPickerPopoverClassName = goldPickerPopoverClassName;

export const locationPickerItemClassName = cn(
  "location-picker-item",
  "cursor-pointer rounded-xl border border-transparent border-l-[3px] border-l-transparent",
  "px-2.5 py-2 text-sm text-gold-bright/90",
  "outline-none transition-[transform,background,border-color,box-shadow,color] duration-200 ease-out",
);

export function locationPickerItemStateClass(isSelected: boolean) {
  return isSelected ? "location-picker-item-active" : undefined;
}

/** @internal — shared gradient panel used by LocationPickerPanel */
export const locationPickerPanelClassName = goldPickerPanelClassName;
