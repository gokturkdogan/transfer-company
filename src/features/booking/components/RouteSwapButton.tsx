"use client";

import { ArrowDownUp } from "lucide-react";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";

type RouteSwapButtonProps = {
  onClick: () => void;
  className?: string;
  disabled?: boolean;
};

export function RouteSwapButton({
  onClick,
  className,
  disabled = false,
}: RouteSwapButtonProps) {
  const t = useTranslations("booking.search");

  return (
    <button
      type="button"
      aria-label={t("swapDirection")}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full",
        "border border-border/70 bg-background text-muted-foreground shadow-sm",
        "transition-colors hover:border-accent/50 hover:bg-accent/10 hover:text-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-40",
        className,
      )}
    >
      <ArrowDownUp className="h-4 w-4 lg:rotate-90" aria-hidden />
    </button>
  );
}
