import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type SummaryFactRowProps = {
  label: string;
  value: string;
  icon?: LucideIcon;
  variant?: "ink" | "surface";
};

export function SummaryFactRow({
  label,
  value,
  icon: Icon,
  variant = "ink",
}: SummaryFactRowProps) {
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-3 py-1.5",
        variant === "ink" ? "text-xs" : "text-sm",
      )}
    >
      <span
        className={cn(
          "flex min-w-0 items-center gap-2",
          variant === "ink" ? "text-white/55" : "text-muted-foreground",
        )}
      >
        {Icon ? (
          <Icon
            className={cn(
              "h-3.5 w-3.5 shrink-0",
              variant === "ink" ? "text-gold/70" : "text-gold-deep/80",
            )}
            aria-hidden
          />
        ) : null}
        {label}
      </span>
      <span
        className={cn(
          "max-w-[58%] shrink-0 text-end font-medium leading-snug",
          variant === "ink" ? "text-white/92" : "text-foreground",
        )}
      >
        {value}
      </span>
    </div>
  );
}
