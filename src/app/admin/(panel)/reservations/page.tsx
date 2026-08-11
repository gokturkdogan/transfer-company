import Link from "next/link";
import { CalendarCheck } from "lucide-react";

import { db } from "@/db/client";
import { ReservationStatusFilters } from "@/features/admin/components/ReservationStatusFilters";
import { ReservationStatusBadge } from "@/features/admin/components/ReservationStatusBadge";
import { AdminContentCard } from "@/features/admin/components/shell/AdminContentCard";
import { AdminPageHeader } from "@/features/admin/components/shell/AdminPageHeader";
import { formatReservationOutboundDate } from "@/features/admin/lib/format-admin-datetime";
import {
  parseReservationStatusFilter,
  ReservationAdminRepository,
} from "@/features/admin/server/reservation-admin-repository";
import { ADMIN_LOCALE, adminCopy } from "@/features/admin/copy";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatMoney } from "@/lib/money";

const reservationAdminRepository = new ReservationAdminRepository(db);

type AdminReservationsPageProps = {
  searchParams: Promise<{
    status?: string;
  }>;
};

export default async function AdminReservationsPage({
  searchParams,
}: AdminReservationsPageProps) {
  const params = await searchParams;
  const activeStatus = parseReservationStatusFilter(params.status);
  const reservations = await reservationAdminRepository.listReservations({
    status: activeStatus === "all" ? undefined : activeStatus,
  });

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title={adminCopy.reservations.title}
        subtitle={adminCopy.reservations.subtitle}
        icon={CalendarCheck}
      />

      <ReservationStatusFilters activeStatus={activeStatus} />

      <AdminContentCard title={adminCopy.reservations.recent} flush>
        <Table className="admin-table">
          <TableHeader>
            <TableRow>
              <TableHead>{adminCopy.reservations.table.reference}</TableHead>
              <TableHead>{adminCopy.reservations.table.customer}</TableHead>
              <TableHead>{adminCopy.reservations.table.outboundDate}</TableHead>
              <TableHead>{adminCopy.reservations.table.origin}</TableHead>
              <TableHead>
                {adminCopy.reservations.table.pricingDestination}
              </TableHead>
              <TableHead>{adminCopy.reservations.table.actualDropoff}</TableHead>
              <TableHead>{adminCopy.reservations.table.status}</TableHead>
              <TableHead>{adminCopy.reservations.table.total}</TableHead>
              <TableHead className="text-right">
                {adminCopy.reservations.table.actions}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reservations.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="py-10 text-center text-sm text-muted-foreground"
                >
                  {adminCopy.reservations.emptyFiltered}
                </TableCell>
              </TableRow>
            ) : (
              reservations.map((reservation) => (
                <TableRow key={reservation.id}>
                  <TableCell className="font-medium">
                    {reservation.reference}
                  </TableCell>
                  <TableCell>{reservation.customerName}</TableCell>
                  <TableCell className="whitespace-nowrap text-sm">
                    {formatReservationOutboundDate(reservation.outboundAt)}
                  </TableCell>
                  <TableCell>{reservation.originName}</TableCell>
                  <TableCell>{reservation.pricingDestinationName}</TableCell>
                  <TableCell>{reservation.actualDropoffLabel}</TableCell>
                  <TableCell>
                    <ReservationStatusBadge status={reservation.status} />
                  </TableCell>
                  <TableCell>
                    {formatMoney(
                      {
                        amountMinor: reservation.totalMinor,
                        currency: reservation.currency,
                      },
                      ADMIN_LOCALE,
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/reservations/${reservation.id}`}>
                        {adminCopy.reservations.view}
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </AdminContentCard>
    </div>
  );
}
