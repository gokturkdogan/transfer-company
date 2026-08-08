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
};

export function BookingFlowNavigation({
  onBack,
  onContinue,
  continueLabel,
  continueDisabled = false,
  continueLoading = false,
  children,
  className,
}: BookingFlowNavigationProps) {
  const t = useTranslations("booking.actions");

  return (
    <div
      className={cn(
        "flex flex-col-reverse gap-3 border-t border-border/60 pt-6 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      {onBack ? (
        <Button type="button" variant="outline" className="gap-2" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden />
          {t("back")}
        </Button>
      ) : (
        <span />
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {children}
        {onContinue && (
          <Button
            type="button"
            variant="gold"
            size="lg"
            disabled={continueDisabled || continueLoading}
            className="gap-2"
            onClick={onContinue}
          >
            {continueLoading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
            {continueLabel ?? t("continue")}
            {!continueLoading && (
              <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
