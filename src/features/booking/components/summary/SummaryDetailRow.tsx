import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type SummaryDetailRowProps = {
  icon: LucideIcon;
  children: ReactNode;
  compact?: boolean;
  tone?: "ink" | "surface";
};

export function SummaryDetailRow({
  icon: Icon,
  children,
  compact = false,
  tone = "surface",
}: SummaryDetailRowProps) {
  return (
    <li
      className={cn(
        "flex items-center border-b last:border-b-0",
        tone === "ink" ? "border-white/8" : "border-border/40",
        compact ? "gap-2.5 py-1.5" : "gap-3 py-2.5",
      )}
    >
      <span
        className={cn(
          "flex shrink-0 items-center justify-center rounded-lg border",
          tone === "ink"
            ? "border-gold/20 bg-gold/10 text-gold"
            : "border-gold/20 bg-gold/14 text-gold-deep",
          compact ? "h-7 w-7" : "h-8 w-8",
        )}
      >
        <Icon className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} aria-hidden />
      </span>
      <span
        className={cn(
          "min-w-0 flex-1 font-medium leading-snug",
          tone === "ink" ? "text-white/90" : "text-foreground",
          compact ? "text-xs" : "text-sm",
        )}
      >
        {children}
      </span>
    </li>
  );
}
