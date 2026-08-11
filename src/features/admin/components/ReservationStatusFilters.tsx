import Link from "next/link";

import {
  RESERVATION_STATUSES,
  type ReservationStatus,
} from "@/db/schema/enums";
import { adminCopy, formatReservationStatus } from "@/features/admin/copy";
import { cn } from "@/lib/utils";

type ReservationStatusFiltersProps = {
  activeStatus: ReservationStatus | "all";
};

export function ReservationStatusFilters({
  activeStatus,
}: ReservationStatusFiltersProps) {
  const filters: Array<{ value: ReservationStatus | "all"; label: string }> = [
    { value: "all", label: adminCopy.reservations.filters.all },
    ...RESERVATION_STATUSES.map((status) => ({
      value: status,
      label: formatReservationStatus(status),
    })),
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((filter) => {
        const isActive = activeStatus === filter.value;
        const href =
          filter.value === "all"
            ? "/admin/reservations"
            : `/admin/reservations?status=${filter.value}`;

        return (
          <Link
            key={filter.value}
            href={href}
            className={cn(
              "inline-flex items-center rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
              isActive
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50",
            )}
          >
            {filter.label}
          </Link>
        );
      })}
    </div>
  );
}
