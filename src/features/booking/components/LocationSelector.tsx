"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";

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
import type { SelectableLocationDto } from "@/features/locations/types";
import { cn } from "@/lib/utils";

type LocationSelectorProps = {
  label: string;
  value: string;
  locations: SelectableLocationDto[];
  onChange: (value: string) => void;
};

const TYPE_ORDER = [
  "AIRPORT",
  "HOTEL",
  "REGION",
  "TRANSFER_POINT",
  "MARINA",
  "CUSTOM_LOCATION",
] as const;

export function LocationSelector({
  label,
  value,
  locations,
  onChange,
}: LocationSelectorProps) {
  const t = useTranslations("booking.locations");
  const [open, setOpen] = useState(false);

  const selected = locations.find((location) => location.id === value);

  const grouped = useMemo(() => {
    const groups = new Map<string, SelectableLocationDto[]>();

    for (const location of locations) {
      const key = location.type;
      const existing = groups.get(key) ?? [];
      existing.push(location);
      groups.set(key, existing);
    }

    return TYPE_ORDER.filter((type) => groups.has(type)).map((type) => ({
      type,
      items: groups.get(type) ?? [],
    }));
  }, [locations]);

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            <span className="truncate">
              {selected?.name ?? t("placeholder")}
            </span>
            <ChevronsUpDown className="ms-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
          <Command>
            <CommandInput placeholder={t("search")} />
            <CommandList>
              <CommandEmpty>{t("empty")}</CommandEmpty>
              {grouped.map((group) => (
                <CommandGroup
                  key={group.type}
                  heading={t(`types.${group.type}`)}
                >
                  {group.items.map((location) => (
                    <CommandItem
                      key={location.id}
                      value={`${location.name} ${location.type}`}
                      onSelect={() => {
                        onChange(location.id);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "me-2 h-4 w-4",
                          value === location.id ? "opacity-100" : "opacity-0",
                        )}
                      />
                      {location.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
