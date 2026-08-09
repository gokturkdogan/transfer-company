"use client";

import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type BookingFlowNavigationProps = {
  onBack?: () => void;
  onContinue?: () => void;
  continueLabel?: string;
  continueDisabled?: boolean;
  continueLoading?: boolean;
  children?: ReactNode;
  className?: string;
  variant?: "default" | "sidebar";
};

export function BookingFlowNavigation({
  onBack,
  onContinue,
  continueLabel,
  continueDisabled = false,
  continueLoading = false,
  children,
  className,
  variant = "default",
}: BookingFlowNavigationProps) {
  const t = useTranslations("booking.actions");
  const isSidebar = variant === "sidebar";

  return (
    <div
      className={cn(
        isSidebar
          ? "flex flex-col gap-3 pt-4"
          : "flex flex-col-reverse gap-3 border-t border-border/60 pt-6 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      {onContinue && (
        <Button
          type="button"
          variant="gold"
          size={isSidebar ? "default" : "lg"}
          disabled={continueDisabled || continueLoading}
          className={cn("gap-2", isSidebar && "h-11 w-full")}
          onClick={onContinue}
        >
          {continueLoading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
          {continueLabel ?? t("continue")}
          {!continueLoading && (
            <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
          )}
        </Button>
      )}

      {children}

      {onBack ? (
        <Button
          type="button"
          variant="outline"
          className={cn("gap-2", isSidebar && "h-10 w-full")}
          onClick={onBack}
        >
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden />
          {t("back")}
        </Button>
      ) : isSidebar ? null : (
        <span />
      )}
    </div>
  );
}
