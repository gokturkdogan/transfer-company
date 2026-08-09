"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
  className?: string;
  appearance?: "default" | "booking";
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
  className,
  appearance = "default",
}: LocationComboboxProps) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.id === value);
  const groups = [...new Set(options.map((option) => option.group).filter(Boolean))];

  return (
    <div
      className={cn(
        appearance === "booking" ? bookingFormFieldGroupClass : "space-y-2",
        className,
      )}
    >
      <Label className={appearance === "booking" ? bookingFormLabelClass : undefined}>
        {label}
      </Label>
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
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
          <Command>
            <CommandInput placeholder={searchPlaceholder} />
            <CommandList>
              <CommandEmpty>{emptyLabel}</CommandEmpty>
              {groups.length > 0
                ? groups.map((group) => (
                    <CommandGroup key={group} heading={group}>
                      {options
                        .filter((option) => option.group === group)
                        .map((option) => (
                          <CommandItem
                            key={option.id}
                            value={`${option.label} ${option.id}`}
                            onSelect={() => {
                              onChange(option.id);
                              setOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "me-2 h-4 w-4",
                                value === option.id ? "opacity-100" : "opacity-0",
                              )}
                            />
                            {option.label}
                          </CommandItem>
                        ))}
                    </CommandGroup>
                  ))
                : options.map((option) => (
                    <CommandItem
                      key={option.id}
                      value={`${option.label} ${option.id}`}
                      onSelect={() => {
                        onChange(option.id);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "me-2 h-4 w-4",
                          value === option.id ? "opacity-100" : "opacity-0",
                        )}
                      />
                      {option.label}
                    </CommandItem>
                  ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
