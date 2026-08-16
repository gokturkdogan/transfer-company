"use client";

import { CalendarDays } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { type DateRange } from "react-day-picker";
import { tr } from "react-day-picker/locale";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { ReservationStatus } from "@/features/admin/lib/public-enums";
import {
  buildAdminReservationsHref,
  formatAdminDateFilterLabel,
  isValidIsoDate,
} from "@/features/admin/lib/reservation-date-filter";
import { ADMIN_LOCALE, adminCopy } from "@/features/admin/copy";
import {
  parseIsoDate,
  toIsoDate,
} from "@/features/booking/lib/search-datetime";
import { cn } from "@/lib/utils";

type ReservationDateRangeFilterProps = {
  activeFrom?: string;
  activeTo?: string;
  activeStatus: ReservationStatus | "all";
};

function toDateRange(from?: string, to?: string): DateRange | undefined {
  if (!from || !isValidIsoDate(from)) {
    return undefined;
  }

  const fromDate = parseIsoDate(from);
  const toDate =
    to && isValidIsoDate(to) && to >= from ? parseIsoDate(to) : fromDate;

  return { from: fromDate, to: toDate };
}

export function ReservationDateRangeFilter({
  activeFrom,
  activeTo,
  activeStatus,
}: ReservationDateRangeFilterProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [range, setRange] = useState<DateRange | undefined>(() =>
    toDateRange(activeFrom, activeTo),
  );

  const hasActiveFilter = Boolean(activeFrom && isValidIsoDate(activeFrom));

  const buttonLabel = useMemo(() => {
    if (hasActiveFilter && activeFrom) {
      const toIso =
        activeTo && isValidIsoDate(activeTo) && activeTo >= activeFrom
          ? activeTo
          : activeFrom;

      return formatAdminDateFilterLabel(activeFrom, toIso, ADMIN_LOCALE);
    }

    return adminCopy.reservations.filters.datePlaceholder;
  }, [activeFrom, activeTo, hasActiveFilter]);

  const applyFilter = () => {
    if (!range?.from) {
      return;
    }

    const fromIso = toIsoDate(range.from);
    const toIso = range.to ? toIsoDate(range.to) : fromIso;

    router.push(
      buildAdminReservationsHref({
        status: activeStatus,
        from: fromIso,
        to: toIso !== fromIso ? toIso : undefined,
      }),
    );
    setOpen(false);
  };

  const clearFilter = () => {
    setRange(undefined);
    router.push(
      buildAdminReservationsHref({
        status: activeStatus,
      }),
    );
    setOpen(false);
  };

  return (
    <div className="flex items-center gap-2">
      <Popover
        open={open}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen);
          if (nextOpen) {
            setRange(toDateRange(activeFrom, activeTo));
          }
        }}
      >
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className={cn(
              "h-9 shrink-0 gap-2 border-slate-200 bg-white text-sm font-medium text-slate-700",
              hasActiveFilter && "border-slate-900 text-slate-900",
            )}
          >
            <CalendarDays className="h-4 w-4 text-slate-500" aria-hidden />
            <span className="max-w-[14rem] truncate">{buttonLabel}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          sideOffset={6}
          className="w-[17.5rem] max-w-[calc(100vw-1.5rem)] border-slate-200 bg-white p-0 shadow-lg"
        >
          <div className="datetime-picker w-full">
            <p className="border-b border-slate-100 px-3 py-2 text-[11px] leading-snug text-slate-500">
              {adminCopy.reservations.filters.dateHint}
            </p>
            <div className="flex justify-center px-1 py-2">
              <Calendar
                mode="range"
                locale={tr}
                selected={range}
                onSelect={setRange}
                numberOfMonths={1}
                defaultMonth={range?.from ?? new Date()}
              />
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-slate-100 px-3 py-2.5">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 px-2.5 text-xs"
                onClick={clearFilter}
                disabled={!hasActiveFilter && !range?.from}
              >
                {adminCopy.reservations.filters.clear}
              </Button>
              <Button
                type="button"
                size="sm"
                className="h-8 px-3 text-xs"
                onClick={applyFilter}
                disabled={!range?.from}
              >
                {adminCopy.reservations.filters.apply}
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
