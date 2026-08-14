"use client";

import { Check, type LucideIcon } from "lucide-react";
import { useState } from "react";

import {
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { ComboboxOption } from "@/features/booking/components/LocationCombobox";
import { LocationPickerPanel } from "@/features/booking/components/LocationPickerPanel";
import {
  locationPickerItemClassName,
  locationPickerItemStateClass,
  locationPickerPopoverClassName,
} from "@/features/booking/components/location-picker-styles";
import {
  SearchSegmentShell,
  SegmentValue,
} from "@/features/booking/components/hero-search/SearchSegment";
import { searchEditSheetPopoverClass } from "@/features/booking/components/hero-search/search-overlay-styles";
import { cn } from "@/lib/utils";

type LocationSegmentProps = {
  icon: LucideIcon;
  label: string;
  value: string;
  options: ComboboxOption[];
  placeholder: string;
  searchPlaceholder: string;
  emptyLabel: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
  withDivider?: boolean;
  embedded?: boolean;
};

export function LocationSegment({
  icon,
  label,
  value,
  options,
  placeholder,
  searchPlaceholder,
  emptyLabel,
  onChange,
  disabled = false,
  className,
  withDivider = true,
  embedded = false,
}: LocationSegmentProps) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.id === value);
  const groups = [
    ...new Set(options.map((option) => option.group).filter(Boolean)),
  ] as string[];

  const renderOption = (option: ComboboxOption) => (
    <CommandItem
      key={option.id}
      value={`${option.label} ${option.group ?? ""} ${option.id}`}
      className={cn(
        locationPickerItemClassName,
        locationPickerItemStateClass(value === option.id),
      )}
      onSelect={() => {
        onChange(option.id);
        setOpen(false);
      }}
    >
      <Check
        className={cn(
          "me-2 h-4 w-4 shrink-0 text-gold-bright",
          value === option.id ? "opacity-100" : "opacity-0",
        )}
      />
      {option.label}
    </CommandItem>
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={label}
          disabled={disabled}
          className={cn(
            "cursor-pointer text-start outline-none transition-colors",
            "hover:bg-muted/60 focus-visible:bg-muted/60",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "rounded-2xl lg:rounded-xl",
            className,
          )}
        >
          <SearchSegmentShell
            icon={icon}
            label={label}
            embedded={embedded}
            withDivider={withDivider}
          >
            <SegmentValue placeholder={!selected}>
              {selected?.label ?? placeholder}
            </SegmentValue>
          </SearchSegmentShell>
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="start"
        className={cn(
          locationPickerPopoverClassName,
          "w-[min(22rem,calc(100vw-2rem))]",
          embedded && searchEditSheetPopoverClass,
        )}
      >
        <LocationPickerPanel
          searchPlaceholder={searchPlaceholder}
          emptyLabel={emptyLabel}
        >
          {groups.length > 0
            ? groups.map((group) => (
                <CommandGroup key={group} heading={group}>
                  {options
                    .filter((option) => option.group === group)
                    .map(renderOption)}
                </CommandGroup>
              ))
            : options.map(renderOption)}
        </LocationPickerPanel>
      </PopoverContent>
    </Popover>
  );
}
