import { notFound } from "next/navigation";

import { db } from "@/db/client";
import { ReservationAdminRepository } from "@/features/admin/server/reservation-admin-repository";
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
          Reservation details and pricing context.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Trip</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <span className="font-medium">Status:</span>{" "}
              <Badge variant="secondary">{reservation.status}</Badge>
            </p>
            <p>
              <span className="font-medium">Trip type:</span>{" "}
              {reservation.tripType}
            </p>
            <p>
              <span className="font-medium">Outbound:</span>{" "}
              {reservation.outboundAt.toLocaleString("en-GB")}
            </p>
            {reservation.returnAt ? (
              <p>
                <span className="font-medium">Return:</span>{" "}
                {reservation.returnAt.toLocaleString("en-GB")}
              </p>
            ) : null}
            <p>
              <span className="font-medium">Passengers:</span>{" "}
              {reservation.passengerCount}
            </p>
            <p>
              <span className="font-medium">Luggage:</span>{" "}
              {reservation.largeLuggageCount} large /{" "}
              {reservation.cabinLuggageCount} cabin
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <span className="font-medium">Name:</span>{" "}
              {reservation.customerName}
            </p>
            <p>
              <span className="font-medium">Email:</span>{" "}
              {reservation.customerEmail}
            </p>
            <p>
              <span className="font-medium">Phone:</span>{" "}
              {reservation.customerPhone}
            </p>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Route and drop-off</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <span className="font-medium">Origin:</span>{" "}
              {reservation.originName}
            </p>
            <p>
              <span className="font-medium">Pricing destination:</span>{" "}
              {reservation.pricingDestinationName}
            </p>
            <p>
              <span className="font-medium">Actual drop-off:</span>{" "}
              {reservation.actualDropoffLabel}
            </p>
            {reservation.hotelName ? (
              <p>
                <span className="font-medium">Hotel:</span>{" "}
                {reservation.hotelName}
              </p>
            ) : null}
            {reservation.customDestinationName ? (
              <p>
                <span className="font-medium">Custom destination:</span>{" "}
                {reservation.customDestinationName}
              </p>
            ) : null}
            {reservation.customDestinationAddress ? (
              <p>
                <span className="font-medium">Custom address:</span>{" "}
                {reservation.customDestinationAddress}
              </p>
            ) : null}
            <p>
              <span className="font-medium">Route snapshot:</span>{" "}
              {reservation.snapshotRouteLabel}
            </p>
            {reservation.snapshotDropoffLabel ? (
              <p>
                <span className="font-medium">Drop-off snapshot:</span>{" "}
                {reservation.snapshotDropoffLabel}
              </p>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Line items</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Total</TableHead>
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
                      "en",
                    )}
                  </TableCell>
                  <TableCell>
                    {formatMoney(
                      {
                        amountMinor: item.totalPriceMinor,
                        currency: reservation.currency,
                      },
                      "en",
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="mt-4 space-y-1 text-sm">
            <p>
              <span className="font-medium">Subtotal:</span>{" "}
              {formatMoney(
                {
                  amountMinor: reservation.subtotalMinor,
                  currency: reservation.currency,
                },
                "en",
              )}
            </p>
            <p>
              <span className="font-medium">Total:</span>{" "}
              {formatMoney(
                {
                  amountMinor: reservation.totalMinor,
                  currency: reservation.currency,
                },
                "en",
              )}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
