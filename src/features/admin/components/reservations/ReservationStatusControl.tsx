"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ReservationStatusBadge } from "@/features/admin/components/ReservationStatusBadge";
import { updateReservationStatusAction } from "@/features/admin/server/reservation-status-actions";
import {
  adminCopy,
  formatReservationStatus,
  translateAdminError,
} from "@/features/admin/copy";
import type { ReservationStatus } from "@/db/schema/enums";
import { RESERVATION_STATUSES } from "@/db/schema/enums";

type ReservationStatusControlProps = {
  reservationId: string;
  currentStatus: ReservationStatus;
};

export function ReservationStatusControl({
  reservationId,
  currentStatus,
}: ReservationStatusControlProps) {
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] =
    useState<ReservationStatus>(currentStatus);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setSelectedStatus(currentStatus);
  }, [currentStatus]);

  const hasChanges = selectedStatus !== currentStatus;

  function handleSubmit() {
    if (!hasChanges) {
      return;
    }

    startTransition(async () => {
      setError(null);
      setMessage(null);

      const result = await updateReservationStatusAction({
        reservationId,
        status: selectedStatus,
      });

      if (!result.success) {
        setError(translateAdminError(result.error.message));
        return;
      }

      if (result.data.unchanged) {
        setMessage(adminCopy.reservations.statusControl.unchanged);
        return;
      }

      if (result.data.emailSent) {
        setMessage(adminCopy.reservations.statusControl.successWithEmail);
      } else {
        setMessage(adminCopy.reservations.statusControl.successWithoutEmail);
      }

      router.refresh();
    });
  }

  return (
    <div className="admin-content-card rounded-xl border bg-white p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <div>
            <p className="text-sm font-semibold text-slate-900">
              {adminCopy.reservations.statusControl.title}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {adminCopy.reservations.statusControl.description}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {adminCopy.reservations.fields.status}
            </span>
            <ReservationStatusBadge status={currentStatus} />
          </div>
        </div>

        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center lg:w-auto">
          <Select
            value={selectedStatus}
            onValueChange={(value) =>
              setSelectedStatus(value as ReservationStatus)
            }
            disabled={isPending}
          >
            <SelectTrigger className="w-full sm:w-[220px]">
              <SelectValue
                placeholder={adminCopy.reservations.statusControl.selectPlaceholder}
              />
            </SelectTrigger>
            <SelectContent>
              {RESERVATION_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {formatReservationStatus(status)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isPending || !hasChanges}
            className="sm:min-w-[160px]"
          >
            {isPending
              ? adminCopy.reservations.statusControl.submitting
              : adminCopy.reservations.statusControl.submit}
          </Button>
        </div>
      </div>

      {message ? (
        <p className="mt-4 text-sm text-emerald-700">{message}</p>
      ) : null}
      {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
