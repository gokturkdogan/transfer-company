"use client";

import { Check, type LucideIcon } from "lucide-react";
import { useState } from "react";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { ComboboxOption } from "@/features/booking/components/LocationCombobox";
import {
  SearchSegmentShell,
  SegmentValue,
} from "@/features/booking/components/hero-search/SearchSegment";
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
      onSelect={() => {
        onChange(option.id);
        setOpen(false);
      }}
    >
      <Check
        className={cn(
          "me-2 h-4 w-4 text-gold-deep",
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
            withDivider={withDivider}
          >
            <SegmentValue placeholder={!selected}>
              {selected?.label ?? placeholder}
            </SegmentValue>
          </SearchSegmentShell>
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[min(22rem,calc(100vw-2rem))] rounded-2xl border-border/70 p-0 shadow-premium"
      >
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyLabel}</CommandEmpty>
            {groups.length > 0
              ? groups.map((group) => (
                  <CommandGroup key={group} heading={group}>
                    {options
                      .filter((option) => option.group === group)
                      .map(renderOption)}
                  </CommandGroup>
                ))
              : options.map(renderOption)}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
