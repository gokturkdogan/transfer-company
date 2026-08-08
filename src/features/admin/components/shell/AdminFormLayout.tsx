import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type AdminFormRowProps = {
  children: ReactNode;
  className?: string;
};

/** Two-column form row on large screens; stacks on mobile. */
export function AdminFormRow({ children, className }: AdminFormRowProps) {
  return (
    <div
      className={cn(
        "grid gap-4 lg:grid-cols-2 lg:items-start xl:gap-5",
        className,
      )}
    >
      {children}
    </div>
  );
}

type AdminFormStackProps = {
  children: ReactNode;
  className?: string;
};

/** Vertical stack of sections within a column. */
export function AdminFormStack({ children, className }: AdminFormStackProps) {
  return <div className={cn("space-y-4", className)}>{children}</div>;
}

type AdminFormGridProps = {
  children: ReactNode;
  cols?: 2 | 3 | 4;
  className?: string;
};

const GRID_COLS: Record<NonNullable<AdminFormGridProps["cols"]>, string> = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
};

export function AdminFormGrid({
  children,
  cols = 2,
  className,
}: AdminFormGridProps) {
  return (
    <div className={cn("grid gap-4", GRID_COLS[cols], className)}>{children}</div>
  );
}
