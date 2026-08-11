import { RESERVATION_STATUSES, type ReservationStatus } from "@/db/schema/enums";
import { Badge } from "@/components/ui/badge";
import { formatReservationStatus } from "@/features/admin/copy";

const STATUS_VARIANTS: Record<
  ReservationStatus,
  "warning" | "info" | "success" | "destructive"
> = {
  PENDING: "warning",
  CONFIRMED: "info",
  COMPLETED: "success",
  CANCELLED: "destructive",
};

type ReservationStatusBadgeProps = {
  status: ReservationStatus;
};

export function ReservationStatusBadge({ status }: ReservationStatusBadgeProps) {
  return (
    <Badge variant={STATUS_VARIANTS[status]}>
      {formatReservationStatus(status)}
    </Badge>
  );
}
