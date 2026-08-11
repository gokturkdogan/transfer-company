"use client";

import { useTranslations } from "next-intl";

import { useBookingFlow } from "@/features/booking/context/booking-flow-context";
import { formatAcceptedPaymentCurrencyList } from "@/features/currencies/types";
import { cn } from "@/lib/utils";

type AcceptedPaymentCurrenciesNoticeProps = {
  className?: string;
  compact?: boolean;
  tone?: "default" | "onDark";
};

export function AcceptedPaymentCurrenciesNotice({
  className,
  compact = false,
  tone = "default",
}: AcceptedPaymentCurrenciesNoticeProps) {
  const t = useTranslations("booking.paymentCurrencies");
  const { acceptedPaymentCurrencies } = useBookingFlow();

  if (acceptedPaymentCurrencies.length === 0) {
    return null;
  }

  const currencyList = formatAcceptedPaymentCurrencyList(acceptedPaymentCurrencies);
  const onDark = tone === "onDark";

  return (
    <div
      className={cn(
        "rounded-xl border text-sm",
        compact ? "px-4 py-3" : "p-4",
        onDark
          ? "border-white/15 bg-white/8 text-white/90"
          : "border-border/70 bg-muted/35 text-foreground/90",
        className,
      )}
    >
      <p className={cn("font-semibold", onDark ? "text-white" : "text-foreground")}>
        {t("title")}
      </p>
      <p
        className={cn(
          "mt-1.5 leading-relaxed",
          onDark ? "text-white/70" : "text-muted-foreground",
        )}
      >
        {t("notice")}
      </p>
      <p
        className={cn(
          "mt-2 text-base font-medium tracking-tight",
          onDark && "text-gold-light",
        )}
      >
        {currencyList}
      </p>
    </div>
  );
}
