"use client";

import { useTranslations } from "next-intl";

import { useBookingFlow } from "@/features/booking/context/booking-flow-context";
import { formatAcceptedPaymentCurrencyList } from "@/features/currencies/types";
import { cn } from "@/lib/utils";

type AcceptedPaymentCurrenciesNoticeProps = {
  className?: string;
  compact?: boolean;
};

export function AcceptedPaymentCurrenciesNotice({
  className,
  compact = false,
}: AcceptedPaymentCurrenciesNoticeProps) {
  const t = useTranslations("booking.paymentCurrencies");
  const { acceptedPaymentCurrencies } = useBookingFlow();

  if (acceptedPaymentCurrencies.length === 0) {
    return null;
  }

  const currencyList = formatAcceptedPaymentCurrencyList(acceptedPaymentCurrencies);

  return (
    <div
      className={cn(
        "rounded-xl border border-border/70 bg-muted/35 text-sm text-foreground/90",
        compact ? "px-4 py-3" : "p-4",
        className,
      )}
    >
      <p className="font-semibold text-foreground">{t("title")}</p>
      <p className="mt-1.5 leading-relaxed text-muted-foreground">{t("notice")}</p>
      <p className="mt-2 text-base font-medium tracking-tight">{currencyList}</p>
    </div>
  );
}
