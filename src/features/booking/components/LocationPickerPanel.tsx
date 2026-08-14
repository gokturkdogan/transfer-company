"use client";

import type { ComponentProps, ReactNode } from "react";

import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandList,
} from "@/components/ui/command";
import { locationPickerPanelClassName } from "@/features/booking/components/location-picker-styles";
import { cn } from "@/lib/utils";

type LocationPickerPanelProps = {
  searchPlaceholder: string;
  emptyLabel: string;
  children: ReactNode;
  className?: string;
  filter?: ComponentProps<typeof Command>["filter"];
};

export function LocationPickerPanel({
  searchPlaceholder,
  emptyLabel,
  children,
  className,
  filter,
}: LocationPickerPanelProps) {
  return (
    <Command
      filter={filter}
      className={cn(locationPickerPanelClassName, "bg-transparent", className)}
    >
      <CommandInput placeholder={searchPlaceholder} />
      <CommandList className="location-picker-list">
        <CommandEmpty className="location-picker-empty">{emptyLabel}</CommandEmpty>
        {children}
      </CommandList>
    </Command>
  );
}
