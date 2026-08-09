"use client";

import type { LucideIcon } from "lucide-react";
import { Pencil } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type SearchSegmentShellProps = {
  icon: LucideIcon;
  label: string;
  children: ReactNode;
  className?: string;
  embedded?: boolean;
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
  embedded = false,
  withDivider = true,
}: SearchSegmentShellProps) {
  return (
    <div
      className={cn(
        "relative min-w-0 transition-colors",
        embedded
          ? "rounded-xl max-lg:min-h-0 max-lg:border-0 max-lg:bg-transparent"
          : "rounded-2xl max-lg:min-h-[4.25rem] max-lg:border max-lg:border-border/45 max-lg:bg-muted/30 lg:rounded-xl",
        withDivider &&
          !embedded &&
          "lg:before:absolute lg:before:inset-y-2.5 lg:before:end-0 lg:before:w-px lg:before:bg-border/70",
        className,
      )}
    >
      <div
        className={cn(
          "flex min-w-0 items-center gap-3 lg:gap-2.5 lg:px-4 lg:py-2",
          embedded
            ? "px-1 py-2.5"
            : "px-3.5 py-3 max-lg:py-3.5",
        )}
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gold/14 text-gold-deep lg:h-8 lg:w-8 lg:rounded-lg lg:bg-gold/12">
          <Icon className="h-4 w-4 lg:h-4 lg:w-4" aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground lg:text-[10px]">
            {label}
          </span>
          {children}
        </span>
        {embedded ? (
          <Pencil
            className="h-4 w-4 shrink-0 text-gold-deep/55"
            aria-hidden
          />
        ) : null}
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
        "block truncate text-[15px] font-semibold leading-snug lg:text-sm lg:leading-tight",
        placeholder ? "text-muted-foreground/70" : "text-foreground",
      )}
    >
      {children}
    </span>
  );
}
