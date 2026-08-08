import Link from "next/link";

import { db } from "@/db/client";
import { ReservationAdminRepository } from "@/features/admin/server/reservation-admin-repository";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Reservations</h1>
        <p className="text-sm text-muted-foreground">
          Review booking requests and drop-off details.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent reservations</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reference</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Origin</TableHead>
                <TableHead>Pricing destination</TableHead>
                <TableHead>Actual drop-off</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total</TableHead>
                <TableHead className="text-right">Actions</TableHead>
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
                    <Badge variant="secondary">{reservation.status}</Badge>
                  </TableCell>
                  <TableCell>
                    {formatMoney(
                      {
                        amountMinor: reservation.totalMinor,
                        currency: reservation.currency,
                      },
                      "en",
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/reservations/${reservation.id}`}>
                        View
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
