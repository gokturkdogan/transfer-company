"use client";

import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils";

type BookingSearchEditSheetProps = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
};

export function BookingSearchEditSheet({
  open,
  onClose,
  children,
}: BookingSearchEditSheetProps) {
  const t = useTranslations("booking.search");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, open]);

  if (!mounted) {
    return null;
  }

  return createPortal(
    <div
      className={cn(
        "fixed inset-0 z-[70] flex flex-col justify-end lg:hidden",
        open ? "pointer-events-auto" : "pointer-events-none",
      )}
      aria-hidden={!open}
    >
      <button
        type="button"
        aria-label={t("mobileEditSearchClose")}
        tabIndex={open ? 0 : -1}
        onClick={onClose}
        className={cn(
          "absolute inset-0 cursor-pointer bg-black/50 backdrop-blur-[3px] transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0",
        )}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t("mobileEditSearchTitle")}
        className={cn(
          "relative z-[1] flex w-full max-h-[92dvh] flex-col",
          "rounded-t-[1.85rem] bg-background/98 shadow-[0_-24px_64px_rgb(0_0_0/0.22)] backdrop-blur-xl",
          "transition-transform duration-300 ease-out",
          "before:pointer-events-none before:absolute before:inset-x-10 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-gold/30 before:to-transparent",
          open ? "translate-y-0" : "translate-y-full",
        )}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex flex-col items-center px-4 pt-3">
          <span
            aria-hidden
            className="mb-3 h-1 w-10 rounded-full bg-border/80"
          />
          <div className="flex w-full items-center justify-between gap-3 pb-1">
            <h2 className="text-sm font-semibold tracking-tight text-foreground">
              {t("mobileEditSearchTitle")}
            </h2>
            <button
              type="button"
              aria-label={t("mobileEditSearchClose")}
              onClick={onClose}
              className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto overscroll-contain px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-2">
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
}
