"use client";

import { Minus, Plus } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { bookingFormCompositeClass } from "@/features/booking/components/booking-form-styles";
import { cn } from "@/lib/utils";

type CounterFieldProps = {
  label: string;
  value: number;
  min?: number;
  max?: number;
  compact?: boolean;
  variant?: "default" | "inline";
  onChange: (value: number) => void;
};

export function CounterField({
  label,
  value,
  min = 0,
  max = 99,
  compact = false,
  variant = "default",
  onChange,
}: CounterFieldProps) {
  const t = useTranslations("common");

  const controls = (
    <div className="flex items-center gap-1">
      <Button
        type="button"
        variant="outline"
        size="icon"
        className={cn(
          "h-8 w-8 rounded-lg border-border/40 bg-background/80 shadow-none hover:border-gold/30",
          variant === "inline" && "h-7 w-7",
        )}
        aria-label={t("decreaseAria", { label })}
        disabled={value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
      >
        <Minus className="h-3.5 w-3.5" />
      </Button>
      <span
        className={cn(
          "min-w-6 text-center text-sm font-medium tabular-nums",
          variant === "inline" && "min-w-5 text-xs",
        )}
      >
        {value}
      </span>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className={cn(
          "h-8 w-8 rounded-lg border-border/40 bg-background/80 shadow-none hover:border-gold/30",
          variant === "inline" && "h-7 w-7",
        )}
        aria-label={t("increaseAria", { label })}
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
      >
        <Plus className="h-3.5 w-3.5" />
      </Button>
    </div>
  );

  if (variant === "inline") {
    return controls;
  }

  return (
    <div
      className={cn(
        bookingFormCompositeClass,
        "items-center justify-between gap-4",
        compact ? "px-3" : "p-3.5",
      )}
    >
      <Label className={cn("font-medium text-foreground/85", compact ? "text-xs" : "text-sm")}>
        {label}
      </Label>
      {controls}
    </div>
  );
}
