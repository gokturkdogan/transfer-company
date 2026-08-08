"use client";

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type SearchSegmentShellProps = {
  icon: LucideIcon;
  label: string;
  children: ReactNode;
  className?: string;
  /** Renders the trailing divider that separates segments on wide screens. */
  withDivider?: boolean;
};

/**
 * Visual shell for one cell of the single-row hero search bar.
 * Keeps icon/label/value rhythm identical across every field type.
 */
export function SearchSegmentShell({
  icon: Icon,
  label,
  children,
  className,
  withDivider = true,
}: SearchSegmentShellProps) {
  return (
    <div
      className={cn(
        "relative min-w-0 rounded-2xl transition-colors lg:rounded-xl",
        withDivider &&
          "lg:before:absolute lg:before:inset-y-2.5 lg:before:end-0 lg:before:w-px lg:before:bg-border/70",
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-2 px-3 py-1.5 max-lg:py-2 lg:gap-2.5 lg:px-4 lg:py-2">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gold/12 text-gold-deep lg:h-8 lg:w-8">
          <Icon className="h-3.5 w-3.5 lg:h-4 lg:w-4" aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {label}
          </span>
          {children}
        </span>
      </div>
    </div>
  );
}

/** Truncating value line used by every segment trigger. */
export function SegmentValue({
  children,
  placeholder = false,
}: {
  children: ReactNode;
  placeholder?: boolean;
}) {
  return (
    <span
      className={cn(
        "block truncate text-sm font-semibold leading-tight",
        placeholder ? "text-muted-foreground/70" : "text-foreground",
      )}
    >
      {children}
    </span>
  );
}
