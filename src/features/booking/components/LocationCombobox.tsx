"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { BookingFieldLabel } from "@/features/booking/components/BookingFieldLabel";
import { LocationPickerPanel } from "@/features/booking/components/LocationPickerPanel";
import {
  createComboboxFilter,
  CUSTOM_HOTEL_OPTION_ID,
} from "@/features/booking/lib/combobox-filter";
import {
  locationPickerItemClassName,
  locationPickerItemStateClass,
  locationPickerPopoverClassName,
} from "@/features/booking/components/location-picker-styles";
import {
  bookingFormFieldGroupClass,
  bookingFormLabelClass,
  bookingFormTriggerClass,
} from "@/features/booking/components/booking-form-styles";
import { cn } from "@/lib/utils";

export type ComboboxOption = {
  id: string;
  label: string;
  group?: string;
};

type LocationComboboxProps = {
  label: string;
  value: string;
  options: ComboboxOption[];
  placeholder: string;
  searchPlaceholder: string;
  emptyLabel: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  appearance?: "default" | "booking";
  /** Option ids that stay visible while the user filters the list (e.g. custom hotel). */
  alwaysVisibleOptionIds?: readonly string[];
};

export function LocationCombobox({
  label,
  value,
  options,
  placeholder,
  searchPlaceholder,
  emptyLabel,
  onChange,
  disabled = false,
  required = false,
  className,
  appearance = "default",
  alwaysVisibleOptionIds = [],
}: LocationComboboxProps) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.id === value);
  const groups = [...new Set(options.map((option) => option.group).filter(Boolean))];
  const comboboxFilter = createComboboxFilter(alwaysVisibleOptionIds);

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
    <div
      className={cn(
        appearance === "booking" ? bookingFormFieldGroupClass : "space-y-2",
        className,
      )}
    >
      {appearance === "booking" ? (
        <BookingFieldLabel label={label} required={required} />
      ) : (
        <Label>{label}</Label>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant={appearance === "booking" ? "ghost" : "outline"}
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className={cn(
              "w-full justify-between font-normal",
              appearance === "booking"
                ? cn(bookingFormTriggerClass, !selected && "text-muted-foreground/65")
                : "h-10 rounded-xl border-border shadow-sm",
            )}
          >
            <span className="truncate">{selected?.label ?? placeholder}</span>
            <ChevronsUpDown className="ms-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className={cn(
            locationPickerPopoverClassName,
            "w-[var(--radix-popover-trigger-width)]",
          )}
        >
          <LocationPickerPanel
            searchPlaceholder={searchPlaceholder}
            emptyLabel={emptyLabel}
            filter={comboboxFilter}
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
    </div>
  );
}
