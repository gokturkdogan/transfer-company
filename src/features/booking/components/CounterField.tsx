"use client";

import { Minus, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type CounterFieldProps = {
  label: string;
  value: number;
  min?: number;
  max?: number;
  compact?: boolean;
  onChange: (value: number) => void;
};

export function CounterField({
  label,
  value,
  min = 0,
  max = 99,
  compact = false,
  onChange,
}: CounterFieldProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-background shadow-sm",
        compact
          ? "flex h-11 items-center justify-between gap-2 px-3"
          : "flex items-center justify-between gap-4 p-3.5",
      )}
    >
      <Label className={cn("font-medium", compact ? "text-xs" : "text-sm")}>
        {label}
      </Label>
      <div className="flex items-center gap-1.5">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className={cn(compact && "h-8 w-8")}
          aria-label={`Decrease ${label}`}
          disabled={value <= min}
          onClick={() => onChange(Math.max(min, value - 1))}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <span
          className={cn(
            "text-center font-semibold",
            compact ? "min-w-6 text-sm" : "min-w-8 text-sm",
          )}
        >
          {value}
        </span>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className={cn(compact && "h-8 w-8")}
          aria-label={`Increase ${label}`}
          disabled={value >= max}
          onClick={() => onChange(Math.min(max, value + 1))}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
