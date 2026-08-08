import Link from "next/link";
import { CalendarCheck } from "lucide-react";

import { db } from "@/db/client";
import { ReservationAdminRepository } from "@/features/admin/server/reservation-admin-repository";
import {
  ADMIN_LOCALE,
  adminCopy,
  formatReservationStatus,
} from "@/features/admin/copy";
import { AdminContentCard } from "@/features/admin/components/shell/AdminContentCard";
import { AdminPageHeader } from "@/features/admin/components/shell/AdminPageHeader";
import { Badge } from "@/components/ui/badge";
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

export default async function AdminReservationsPage() {
  const reservations = await reservationAdminRepository.listReservations();

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title={adminCopy.reservations.title}
        subtitle={adminCopy.reservations.subtitle}
        icon={CalendarCheck}
      />

      <AdminContentCard title={adminCopy.reservations.recent} flush>
        <Table className="admin-table">
            <TableHeader>
              <TableRow>
                <TableHead>{adminCopy.reservations.table.reference}</TableHead>
                <TableHead>{adminCopy.reservations.table.customer}</TableHead>
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
              {reservations.map((reservation) => (
                <TableRow key={reservation.id}>
                  <TableCell className="font-medium">
                    {reservation.reference}
                  </TableCell>
                  <TableCell>{reservation.customerName}</TableCell>
                  <TableCell>{reservation.originName}</TableCell>
                  <TableCell>{reservation.pricingDestinationName}</TableCell>
                  <TableCell>{reservation.actualDropoffLabel}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {formatReservationStatus(reservation.status)}
                    </Badge>
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
              ))}
            </TableBody>
        </Table>
      </AdminContentCard>
    </div>
  );
}
