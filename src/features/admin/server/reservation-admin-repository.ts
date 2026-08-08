import "server-only";

import { desc, eq } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import type { Database } from "@/db/client";
import {
  customers,
  locations,
  reservationItems,
  reservations,
} from "@/db/schema";
import type { ReservationStatus, TripType } from "@/db/schema/enums";
import { NotFoundError } from "@/server/errors";

export type AdminReservationListItem = {
  id: string;
  reference: string;
  status: ReservationStatus;
  tripType: TripType;
  outboundAt: Date;
  originName: string;
  pricingDestinationName: string;
  actualDropoffLabel: string;
  totalMinor: number;
  currency: string;
  customerName: string;
};

export type AdminReservationDetail = AdminReservationListItem & {
  returnAt: Date | null;
  passengerCount: number;
  largeLuggageCount: number;
  cabinLuggageCount: number;
  snapshotRouteLabel: string;
  snapshotDropoffLabel: string | null;
  customDestinationName: string | null;
  customDestinationAddress: string | null;
  hotelName: string | null;
  outboundFlightNumber: string | null;
  returnFlightNumber: string | null;
  subtotalMinor: number;
  notes: string | null;
  customerEmail: string;
  customerPhone: string;
  items: Array<{
    itemType: string;
    snapshotName: string;
    quantity: number;
    unitPriceMinor: number;
    totalPriceMinor: number;
  }>;
};

export class ReservationAdminRepository {
  constructor(private readonly database: Database) {}

  async listReservations(limit = 100): Promise<AdminReservationListItem[]> {
    const pickupLocation = alias(locations, "pickup_location");
    const dropoffLocation = alias(locations, "dropoff_location");

    const rows = await this.database
      .select({
        id: reservations.id,
        reference: reservations.reference,
        status: reservations.status,
        tripType: reservations.tripType,
        outboundAt: reservations.outboundAt,
        totalMinor: reservations.totalMinor,
        currency: reservations.currency,
        snapshotDropoffLabel: reservations.snapshotDropoffLabel,
        customDestinationName: reservations.customDestinationName,
        originName: pickupLocation.defaultName,
        pricingDestinationName: dropoffLocation.defaultName,
        customerFirstName: customers.firstName,
        customerLastName: customers.lastName,
      })
      .from(reservations)
      .innerJoin(customers, eq(reservations.customerId, customers.id))
      .innerJoin(
        pickupLocation,
        eq(reservations.pickupLocationId, pickupLocation.id),
      )
      .innerJoin(
        dropoffLocation,
        eq(reservations.dropoffLocationId, dropoffLocation.id),
      )
      .orderBy(desc(reservations.outboundAt))
      .limit(limit);

    return rows.map((row) => ({
      id: row.id,
      reference: row.reference,
      status: row.status,
      tripType: row.tripType,
      outboundAt: row.outboundAt,
      originName: row.originName,
      pricingDestinationName: row.pricingDestinationName,
      actualDropoffLabel:
        row.snapshotDropoffLabel ??
        row.customDestinationName ??
        row.pricingDestinationName,
      totalMinor: row.totalMinor,
      currency: row.currency,
      customerName: `${row.customerFirstName} ${row.customerLastName}`,
    }));
  }

  async getReservationById(id: string): Promise<AdminReservationDetail> {
    const pickupLocation = alias(locations, "pickup_location");
    const dropoffLocation = alias(locations, "dropoff_location");
    const hotelLocation = alias(locations, "hotel_location");

    const [row] = await this.database
      .select({
        id: reservations.id,
        reference: reservations.reference,
        status: reservations.status,
        tripType: reservations.tripType,
        outboundAt: reservations.outboundAt,
        returnAt: reservations.returnAt,
        passengerCount: reservations.passengerCount,
        largeLuggageCount: reservations.largeLuggageCount,
        cabinLuggageCount: reservations.cabinLuggageCount,
        snapshotRouteLabel: reservations.snapshotRouteLabel,
        snapshotDropoffLabel: reservations.snapshotDropoffLabel,
        customDestinationName: reservations.customDestinationName,
        customDestinationAddress: reservations.customDestinationAddress,
        outboundFlightNumber: reservations.outboundFlightNumber,
        returnFlightNumber: reservations.returnFlightNumber,
        subtotalMinor: reservations.subtotalMinor,
        totalMinor: reservations.totalMinor,
        currency: reservations.currency,
        notes: reservations.notes,
        originName: pickupLocation.defaultName,
        pricingDestinationName: dropoffLocation.defaultName,
        hotelName: hotelLocation.defaultName,
        customerFirstName: customers.firstName,
        customerLastName: customers.lastName,
        customerEmail: customers.email,
        customerPhone: customers.phone,
      })
      .from(reservations)
      .innerJoin(customers, eq(reservations.customerId, customers.id))
      .innerJoin(
        pickupLocation,
        eq(reservations.pickupLocationId, pickupLocation.id),
      )
      .innerJoin(
        dropoffLocation,
        eq(reservations.dropoffLocationId, dropoffLocation.id),
      )
      .leftJoin(
        hotelLocation,
        eq(reservations.hotelLocationId, hotelLocation.id),
      )
      .where(eq(reservations.id, id))
      .limit(1);

    if (!row) {
      throw new NotFoundError("Reservation not found");
    }

    const items = await this.database
      .select({
        itemType: reservationItems.itemType,
        snapshotName: reservationItems.snapshotName,
        quantity: reservationItems.quantity,
        unitPriceMinor: reservationItems.unitPriceMinor,
        totalPriceMinor: reservationItems.totalPriceMinor,
      })
      .from(reservationItems)
      .where(eq(reservationItems.reservationId, id));

    return {
      id: row.id,
      reference: row.reference,
      status: row.status,
      tripType: row.tripType,
      outboundAt: row.outboundAt,
      returnAt: row.returnAt,
      passengerCount: row.passengerCount,
      largeLuggageCount: row.largeLuggageCount,
      cabinLuggageCount: row.cabinLuggageCount,
      snapshotRouteLabel: row.snapshotRouteLabel,
      snapshotDropoffLabel: row.snapshotDropoffLabel,
      customDestinationName: row.customDestinationName,
      customDestinationAddress: row.customDestinationAddress,
      hotelName: row.hotelName,
      outboundFlightNumber: row.outboundFlightNumber,
      returnFlightNumber: row.returnFlightNumber,
      originName: row.originName,
      pricingDestinationName: row.pricingDestinationName,
      actualDropoffLabel:
        row.snapshotDropoffLabel ??
        row.customDestinationName ??
        row.pricingDestinationName,
      subtotalMinor: row.subtotalMinor,
      totalMinor: row.totalMinor,
      currency: row.currency,
      notes: row.notes,
      customerName: `${row.customerFirstName} ${row.customerLastName}`,
      customerEmail: row.customerEmail,
      customerPhone: row.customerPhone,
      items,
    };
  }
}
