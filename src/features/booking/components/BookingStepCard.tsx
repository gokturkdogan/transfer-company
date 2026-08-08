import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type BookingStepCardProps = {
  children: ReactNode;
  className?: string;
};

export function BookingStepCard({ children, className }: BookingStepCardProps) {
  return (
    <div
      className={cn(
        "rounded-[1.25rem] border border-border/70 bg-card/95 p-5 shadow-float sm:rounded-[1.5rem] sm:p-6 md:p-8",
        className,
      )}
    >
      {children}
    </div>
  );
}
