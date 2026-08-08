import { notFound } from "next/navigation";

import { db } from "@/db/client";
import { ReservationAdminRepository } from "@/features/admin/server/reservation-admin-repository";
import {
  ADMIN_LOCALE,
  adminCopy,
  formatReservationStatus,
  formatTripType,
} from "@/features/admin/copy";
import { Badge } from "@/components/ui/badge";
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

export default async function AdminReservationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let reservation;

  try {
    reservation = await reservationAdminRepository.getReservationById(id);
  } catch {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{reservation.reference}</h1>
        <p className="text-sm text-muted-foreground">
          {adminCopy.reservations.detailSubtitle}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{adminCopy.reservations.trip}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <span className="font-medium">
                {adminCopy.reservations.fields.status}:
              </span>{" "}
              <Badge variant="secondary">
                {formatReservationStatus(reservation.status)}
              </Badge>
            </p>
            <p>
              <span className="font-medium">
                {adminCopy.reservations.fields.tripType}:
              </span>{" "}
              {formatTripType(reservation.tripType)}
            </p>
            <p>
              <span className="font-medium">
                {adminCopy.reservations.fields.outbound}:
              </span>{" "}
              {reservation.outboundAt.toLocaleString(ADMIN_LOCALE)}
            </p>
            {reservation.returnAt ? (
              <p>
                <span className="font-medium">
                  {adminCopy.reservations.fields.return}:
                </span>{" "}
                {reservation.returnAt.toLocaleString(ADMIN_LOCALE)}
              </p>
            ) : null}
            <p>
              <span className="font-medium">
                {adminCopy.reservations.fields.passengers}:
              </span>{" "}
              {reservation.passengerCount}
            </p>
            <p>
              <span className="font-medium">
                {adminCopy.reservations.fields.luggage}:
              </span>{" "}
              {reservation.largeLuggageCount}{" "}
              {adminCopy.reservations.fields.luggageLarge} /{" "}
              {reservation.cabinLuggageCount}{" "}
              {adminCopy.reservations.fields.luggageCabin}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{adminCopy.reservations.customer}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <span className="font-medium">
                {adminCopy.reservations.fields.name}:
              </span>{" "}
              {reservation.customerName}
            </p>
            <p>
              <span className="font-medium">
                {adminCopy.reservations.fields.email}:
              </span>{" "}
              {reservation.customerEmail}
            </p>
            <p>
              <span className="font-medium">
                {adminCopy.reservations.fields.phone}:
              </span>{" "}
              {reservation.customerPhone}
            </p>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>{adminCopy.reservations.routeAndDropoff}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <span className="font-medium">
                {adminCopy.reservations.table.origin}:
              </span>{" "}
              {reservation.originName}
            </p>
            <p>
              <span className="font-medium">
                {adminCopy.reservations.table.pricingDestination}:
              </span>{" "}
              {reservation.pricingDestinationName}
            </p>
            <p>
              <span className="font-medium">
                {adminCopy.reservations.table.actualDropoff}:
              </span>{" "}
              {reservation.actualDropoffLabel}
            </p>
            {reservation.hotelName ? (
              <p>
                <span className="font-medium">
                  {adminCopy.reservations.fields.hotel}:
                </span>{" "}
                {reservation.hotelName}
              </p>
            ) : null}
            {reservation.customDestinationName ? (
              <p>
                <span className="font-medium">
                  {adminCopy.reservations.fields.customDestination}:
                </span>{" "}
                {reservation.customDestinationName}
              </p>
            ) : null}
            {reservation.customDestinationAddress ? (
              <p>
                <span className="font-medium">
                  {adminCopy.reservations.fields.customAddress}:
                </span>{" "}
                {reservation.customDestinationAddress}
              </p>
            ) : null}
            <p>
              <span className="font-medium">
                {adminCopy.reservations.fields.routeSnapshot}:
              </span>{" "}
              {reservation.snapshotRouteLabel}
            </p>
            {reservation.snapshotDropoffLabel ? (
              <p>
                <span className="font-medium">
                  {adminCopy.reservations.fields.dropoffSnapshot}:
                </span>{" "}
                {reservation.snapshotDropoffLabel}
              </p>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{adminCopy.reservations.lineItems}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{adminCopy.reservations.table.item}</TableHead>
                <TableHead>{adminCopy.reservations.table.qty}</TableHead>
                <TableHead>{adminCopy.reservations.table.unit}</TableHead>
                <TableHead>{adminCopy.reservations.table.total}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reservation.items.map((item, index) => (
                <TableRow key={`${item.snapshotName}-${index}`}>
                  <TableCell>{item.snapshotName}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>
                    {formatMoney(
                      {
                        amountMinor: item.unitPriceMinor,
                        currency: reservation.currency,
                      },
                      ADMIN_LOCALE,
                    )}
                  </TableCell>
                  <TableCell>
                    {formatMoney(
                      {
                        amountMinor: item.totalPriceMinor,
                        currency: reservation.currency,
                      },
                      ADMIN_LOCALE,
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="mt-4 space-y-1 text-sm">
            <p>
              <span className="font-medium">
                {adminCopy.reservations.fields.subtotal}:
              </span>{" "}
              {formatMoney(
                {
                  amountMinor: reservation.subtotalMinor,
                  currency: reservation.currency,
                },
                ADMIN_LOCALE,
              )}
            </p>
            <p>
              <span className="font-medium">
                {adminCopy.reservations.fields.total}:
              </span>{" "}
              {formatMoney(
                {
                  amountMinor: reservation.totalMinor,
                  currency: reservation.currency,
                },
                ADMIN_LOCALE,
              )}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
