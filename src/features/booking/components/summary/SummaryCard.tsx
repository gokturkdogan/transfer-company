import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type SummaryCardProps = {
  icon?: LucideIcon;
  title?: string;
  children: ReactNode;
  className?: string;
  variant?: "ink" | "surface";
};

export function SummaryCard({
  icon: Icon,
  title,
  children,
  className,
  variant = "ink",
}: SummaryCardProps) {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-2xl border shadow-[0_10px_36px_rgb(0_0_0/0.18)]",
        variant === "ink"
          ? "border-white/10 bg-gradient-to-br from-ink-elevated via-ink-soft to-ink"
          : "border-border/60 bg-card/95",
        className,
      )}
    >
      {title ? (
        <div
          className={cn(
            "flex items-center gap-2 border-b px-4 py-2.5",
            variant === "ink" ? "border-white/8" : "border-border/50",
          )}
        >
          {Icon ? (
            <span
              className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border",
                variant === "ink"
                  ? "border-gold/20 bg-gold/10 text-gold"
                  : "border-gold/25 bg-gold/10 text-gold-deep",
              )}
            >
              <Icon className="h-3.5 w-3.5" aria-hidden />
            </span>
          ) : null}
          <h3
            className={cn(
              "text-[11px] font-bold uppercase tracking-[0.14em]",
              variant === "ink" ? "text-gold-light/90" : "text-gold-deep",
            )}
          >
            {title}
          </h3>
        </div>
      ) : null}
      <div className="px-4 py-3">{children}</div>
    </section>
  );
}
