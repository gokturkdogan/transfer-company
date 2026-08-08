"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ar, de, enUS, ru, tr } from "react-day-picker/locale";

import { Calendar } from "@/components/ui/calendar";
import type { Locale } from "@/config/constants";
import {
  buildTimeSlots,
  formatDateTimeLabel,
  getEffectiveMinDateIso,
  parseIsoDate,
  sanitizeTimeForDate,
  toIsoDate,
} from "@/features/booking/lib/search-datetime";
import { cn } from "@/lib/utils";

const DAY_PICKER_LOCALES = {
  tr,
  en: enUS,
  de,
  ru,
  ar,
} as const;

type DateTimePickerPanelProps = {
  dateValue: string;
  timeValue: string;
  minDate: string;
  onCommit: (date: string, time: string) => void;
};

export function DateTimePickerPanel({
  dateValue,
  timeValue,
  minDate,
  onCommit,
}: DateTimePickerPanelProps) {
  const locale = useLocale();
  const t = useTranslations("booking.search");
  const effectiveMinDate = useMemo(
    () => getEffectiveMinDateIso(minDate),
    [minDate],
  );
  const [pendingDate, setPendingDate] = useState(
    dateValue || effectiveMinDate,
  );
  const [visibleMonth, setVisibleMonth] = useState(() =>
    parseIsoDate(dateValue || effectiveMinDate),
  );
  const [pendingTime, setPendingTime] = useState(
    dateValue
      ? sanitizeTimeForDate(dateValue, timeValue || "10:00", minDate)
      : sanitizeTimeForDate(effectiveMinDate, timeValue || "10:00", minDate),
  );

  useEffect(() => {
    if (!dateValue) {
      return;
    }

    setPendingDate(dateValue);
    setPendingTime(sanitizeTimeForDate(dateValue, timeValue || "10:00", minDate));
    setVisibleMonth(parseIsoDate(dateValue));
  }, [dateValue, minDate, timeValue]);

  const timeSlots = useMemo(
    () => buildTimeSlots(pendingDate, minDate),
    [minDate, pendingDate],
  );

  const selectedDate = parseIsoDate(pendingDate);
  const disabledBefore = parseIsoDate(effectiveMinDate);
  const dayPickerLocale =
    DAY_PICKER_LOCALES[locale as Locale] ?? DAY_PICKER_LOCALES.en;

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) {
      return;
    }

    const nextDate = toIsoDate(date);
    const nextTime = sanitizeTimeForDate(
      nextDate,
      pendingTime || timeValue || "10:00",
      minDate,
    );

    setPendingDate(nextDate);
    setPendingTime(nextTime);
    setVisibleMonth(parseIsoDate(nextDate));
  };

  const handleTimeSelect = (time: string) => {
    setPendingTime(time);
    onCommit(pendingDate, time);
  };

  return (
    <div className="datetime-picker w-fit max-w-[calc(100vw-2rem)] max-lg:w-full max-lg:max-w-none">
      <div className="border-b border-border/60 px-3 py-2.5 max-lg:px-2.5 max-lg:py-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {t("pickTime")}
        </p>
        <p className="mt-0.5 truncate text-sm font-semibold text-foreground">
          {formatDateTimeLabel(pendingDate, pendingTime, locale)}
        </p>
      </div>

      <div className="flex w-fit flex-row items-stretch max-lg:w-full max-lg:max-h-[16rem]">
        <div className="w-fit shrink-0 border-e border-border/60 p-1.5 max-lg:p-1">
          <Calendar
            mode="single"
            locale={dayPickerLocale}
            month={visibleMonth}
            onMonthChange={setVisibleMonth}
            selected={selectedDate}
            onSelect={handleDateSelect}
            disabled={{ before: disabledBefore }}
          />
        </div>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden p-2 max-lg:p-1.5">
          {timeSlots.length > 0 ? (
            <div className="grid min-h-0 flex-1 auto-rows-min grid-cols-2 gap-1 overflow-y-auto overscroll-contain pr-0.5 lg:max-h-[14rem] lg:w-fit lg:grid-cols-2">
              {timeSlots.map((slot) => {
                const active = slot === pendingTime;

                return (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => handleTimeSelect(slot)}
                    className={cn(
                      "min-w-0 cursor-pointer rounded-lg px-1 py-1.5 text-center text-[11px] font-semibold transition-colors lg:min-w-[2.75rem] lg:px-1.5 lg:text-xs",
                      "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold/40",
                      active
                        ? "bg-gold-gradient text-ink shadow-[0_2px_10px_rgb(200_164_93/0.28)]"
                        : "bg-muted/60 text-foreground/90 hover:bg-gold/10 hover:text-gold-deep",
                    )}
                  >
                    {slot}
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="m-auto px-2 text-center text-sm text-muted-foreground">
              {t("noTimesAvailable")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
