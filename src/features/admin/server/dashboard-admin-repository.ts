import "server-only";

import { and, count, desc, eq, ne, sql } from "drizzle-orm";

import { DEFAULT_CURRENCY } from "@/config/constants";
import type { Database } from "@/db/client";
import {
  customers,
  reservationItems,
  reservations,
} from "@/db/schema";

export type DashboardRevenueStats = {
  totalMinor: number;
  upcomingMinor: number;
  completedMinor: number;
  cancelledMinor: number;
  totalCount: number;
  upcomingCount: number;
  completedCount: number;
  cancelledCount: number;
};

export type DashboardTrendPoint = {
  label: string;
  count: number;
  revenueMinor: number;
};

export type DashboardBreakdownItem = {
  name: string;
  count: number;
};

export type DashboardRecentReservation = {
  id: string;
  reference: string;
  status: string;
  outboundAt: string;
  routeLabel: string;
  totalMinor: number;
  currency: string;
  customerName: string;
};

export type DashboardData = {
  summary: {
    totalReservations: number;
    upcomingReservations: number;
    completedReservations: number;
    cancelledReservations: number;
    cancellationRate: number;
    totalPassengers: number;
    oneWayCount: number;
    roundTripCount: number;
  };
  revenueStats: DashboardRevenueStats;
  vehicleBreakdown: DashboardBreakdownItem[];
  routeBreakdown: DashboardBreakdownItem[];
  weeklyTrend: DashboardTrendPoint[];
  monthlyTrend: DashboardTrendPoint[];
  statusBreakdown: DashboardBreakdownItem[];
  weekdayBreakdown: DashboardBreakdownItem[];
  recentReservations: DashboardRecentReservation[];
};

const WEEKDAY_LABELS = [
  "Pazar",
  "Pazartesi",
  "Salı",
  "Çarşamba",
  "Perşembe",
  "Cuma",
  "Cumartesi",
] as const;

function toNumber(value: string | number | null | undefined): number {
  if (value === null || value === undefined) {
    return 0;
  }

  return typeof value === "number" ? value : Number(value);
}

function formatWeekLabel(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "short",
  }).format(date);
}

function formatMonthLabel(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("tr-TR", {
    month: "short",
    year: "numeric",
  }).format(date);
}

export class DashboardAdminRepository {
  constructor(private readonly database: Database) {}

  async getDashboardData(): Promise<DashboardData> {
    const [
      summaryRow,
      revenueStats,
      vehicleRows,
      routeRows,
      weeklyRows,
      monthlyRows,
      statusRows,
      weekdayRows,
      recentRows,
    ] = await Promise.all([
      this.loadSummary(),
      this.loadRevenueStats(),
      this.loadVehicleBreakdown(),
      this.loadRouteBreakdown(),
      this.loadWeeklyTrend(),
      this.loadMonthlyTrend(),
      this.loadStatusBreakdown(),
      this.loadWeekdayBreakdown(),
      this.loadRecentReservations(),
    ]);

    const totalReservations = toNumber(summaryRow?.totalReservations);
    const cancelledReservations = toNumber(summaryRow?.cancelledReservations);

    return {
      summary: {
        totalReservations,
        upcomingReservations: toNumber(summaryRow?.upcomingReservations),
        completedReservations: toNumber(summaryRow?.completedReservations),
        cancelledReservations,
        cancellationRate:
          totalReservations > 0
            ? Math.round((cancelledReservations / totalReservations) * 1000) /
              10
            : 0,
        totalPassengers: toNumber(summaryRow?.totalPassengers),
        oneWayCount: toNumber(summaryRow?.oneWayCount),
        roundTripCount: toNumber(summaryRow?.roundTripCount),
      },
      revenueStats,
      vehicleBreakdown: vehicleRows.map((row) => ({
        name: row.name,
        count: toNumber(row.count),
      })),
      routeBreakdown: routeRows.map((row) => ({
        name: row.name,
        count: toNumber(row.count),
      })),
      weeklyTrend: weeklyRows.map((row) => ({
        label: formatWeekLabel(row.period),
        count: toNumber(row.count),
        revenueMinor: toNumber(row.revenueMinor),
      })),
      monthlyTrend: monthlyRows.map((row) => ({
        label: formatMonthLabel(row.period),
        count: toNumber(row.count),
        revenueMinor: toNumber(row.revenueMinor),
      })),
      statusBreakdown: statusRows.map((row) => ({
        name: row.status,
        count: toNumber(row.count),
      })),
      weekdayBreakdown: weekdayRows.map((row) => ({
        name: WEEKDAY_LABELS[row.dayIndex] ?? `Gün ${row.dayIndex}`,
        count: toNumber(row.count),
      })),
      recentReservations: recentRows,
    };
  }

  private async loadSummary() {
    const [row] = await this.database
      .select({
        totalReservations: count(),
        upcomingReservations: sql<number>`count(*) filter (where ${reservations.status} in ('PENDING', 'CONFIRMED') and ${reservations.outboundAt} > now())`,
        completedReservations: sql<number>`count(*) filter (where ${reservations.status} <> 'CANCELLED' and (${reservations.status} = 'COMPLETED' or ${reservations.outboundAt} <= now()))`,
        cancelledReservations: sql<number>`count(*) filter (where ${reservations.status} = 'CANCELLED')`,
        totalPassengers: sql<number>`coalesce(sum(${reservations.passengerCount}) filter (where ${reservations.status} <> 'CANCELLED'), 0)`,
        oneWayCount: sql<number>`count(*) filter (where ${reservations.tripType} = 'ONE_WAY' and ${reservations.status} <> 'CANCELLED')`,
        roundTripCount: sql<number>`count(*) filter (where ${reservations.tripType} = 'ROUND_TRIP' and ${reservations.status} <> 'CANCELLED')`,
      })
      .from(reservations);

    return row;
  }

  private async loadRevenueStats(): Promise<DashboardRevenueStats> {
    const [row] = await this.database
      .select({
        totalMinor: sql<number>`coalesce(sum(${reservations.totalMinor}) filter (where ${reservations.status} <> 'CANCELLED' and ${reservations.currency} = ${DEFAULT_CURRENCY}), 0)`,
        upcomingMinor: sql<number>`coalesce(sum(${reservations.totalMinor}) filter (where ${reservations.status} in ('PENDING', 'CONFIRMED') and ${reservations.outboundAt} > now() and ${reservations.currency} = ${DEFAULT_CURRENCY}), 0)`,
        completedMinor: sql<number>`coalesce(sum(${reservations.totalMinor}) filter (where ${reservations.status} <> 'CANCELLED' and (${reservations.status} = 'COMPLETED' or ${reservations.outboundAt} <= now()) and ${reservations.currency} = ${DEFAULT_CURRENCY}), 0)`,
        cancelledMinor: sql<number>`coalesce(sum(${reservations.totalMinor}) filter (where ${reservations.status} = 'CANCELLED' and ${reservations.currency} = ${DEFAULT_CURRENCY}), 0)`,
        totalCount: sql<number>`count(*) filter (where ${reservations.status} <> 'CANCELLED' and ${reservations.currency} = ${DEFAULT_CURRENCY})`,
        upcomingCount: sql<number>`count(*) filter (where ${reservations.status} in ('PENDING', 'CONFIRMED') and ${reservations.outboundAt} > now() and ${reservations.currency} = ${DEFAULT_CURRENCY})`,
        completedCount: sql<number>`count(*) filter (where ${reservations.status} <> 'CANCELLED' and (${reservations.status} = 'COMPLETED' or ${reservations.outboundAt} <= now()) and ${reservations.currency} = ${DEFAULT_CURRENCY})`,
        cancelledCount: sql<number>`count(*) filter (where ${reservations.status} = 'CANCELLED' and ${reservations.currency} = ${DEFAULT_CURRENCY})`,
      })
      .from(reservations);

    return {
      totalMinor: toNumber(row?.totalMinor),
      upcomingMinor: toNumber(row?.upcomingMinor),
      completedMinor: toNumber(row?.completedMinor),
      cancelledMinor: toNumber(row?.cancelledMinor),
      totalCount: toNumber(row?.totalCount),
      upcomingCount: toNumber(row?.upcomingCount),
      completedCount: toNumber(row?.completedCount),
      cancelledCount: toNumber(row?.cancelledCount),
    };
  }

  private async loadVehicleBreakdown() {
    return this.database
      .select({
        name: reservationItems.snapshotName,
        count: sql<number>`coalesce(sum(${reservationItems.quantity}), 0)`,
      })
      .from(reservationItems)
      .innerJoin(reservations, eq(reservationItems.reservationId, reservations.id))
      .where(
        and(
          eq(reservationItems.itemType, "TRANSFER_VEHICLE"),
          ne(reservations.status, "CANCELLED"),
        ),
      )
      .groupBy(reservationItems.snapshotName)
      .orderBy(desc(sql`coalesce(sum(${reservationItems.quantity}), 0)`))
      .limit(8);
  }

  private async loadRouteBreakdown() {
    return this.database
      .select({
        name: reservations.snapshotRouteLabel,
        count: count(),
      })
      .from(reservations)
      .where(ne(reservations.status, "CANCELLED"))
      .groupBy(reservations.snapshotRouteLabel)
      .orderBy(desc(count()))
      .limit(8);
  }

  private async loadWeeklyTrend() {
    return this.database
      .select({
        period: sql<string>`date_trunc('week', ${reservations.createdAt})::text`,
        count: sql<number>`count(*) filter (where ${reservations.status} <> 'CANCELLED')`,
        revenueMinor: sql<number>`coalesce(sum(${reservations.totalMinor}) filter (where ${reservations.status} <> 'CANCELLED' and ${reservations.currency} = ${DEFAULT_CURRENCY}), 0)`,
      })
      .from(reservations)
      .where(
        sql`${reservations.createdAt} >= now() - interval '12 weeks'`,
      )
      .groupBy(sql`date_trunc('week', ${reservations.createdAt})`)
      .orderBy(sql`date_trunc('week', ${reservations.createdAt})`);
  }

  private async loadMonthlyTrend() {
    return this.database
      .select({
        period: sql<string>`date_trunc('month', ${reservations.createdAt})::text`,
        count: sql<number>`count(*) filter (where ${reservations.status} <> 'CANCELLED')`,
        revenueMinor: sql<number>`coalesce(sum(${reservations.totalMinor}) filter (where ${reservations.status} <> 'CANCELLED' and ${reservations.currency} = ${DEFAULT_CURRENCY}), 0)`,
      })
      .from(reservations)
      .where(
        sql`${reservations.createdAt} >= now() - interval '12 months'`,
      )
      .groupBy(sql`date_trunc('month', ${reservations.createdAt})`)
      .orderBy(sql`date_trunc('month', ${reservations.createdAt})`);
  }

  private async loadStatusBreakdown() {
    return this.database
      .select({
        status: reservations.status,
        count: count(),
      })
      .from(reservations)
      .groupBy(reservations.status)
      .orderBy(desc(count()));
  }

  private async loadWeekdayBreakdown() {
    const rows = await this.database
      .select({
        dayIndex: sql<number>`extract(dow from ${reservations.outboundAt})::int`,
        count: count(),
      })
      .from(reservations)
      .where(ne(reservations.status, "CANCELLED"))
      .groupBy(sql`extract(dow from ${reservations.outboundAt})`)
      .orderBy(sql`extract(dow from ${reservations.outboundAt})`);

    return rows.map((row) => ({
      dayIndex: toNumber(row.dayIndex),
      count: toNumber(row.count),
    }));
  }

  private async loadRecentReservations(): Promise<DashboardRecentReservation[]> {
    const rows = await this.database
      .select({
        id: reservations.id,
        reference: reservations.reference,
        status: reservations.status,
        outboundAt: reservations.outboundAt,
        routeLabel: reservations.snapshotRouteLabel,
        totalMinor: reservations.totalMinor,
        currency: reservations.currency,
        customerFirstName: customers.firstName,
        customerLastName: customers.lastName,
      })
      .from(reservations)
      .innerJoin(customers, eq(reservations.customerId, customers.id))
      .where(eq(reservations.currency, DEFAULT_CURRENCY))
      .orderBy(desc(reservations.createdAt))
      .limit(8);

    return rows.map((row) => ({
      id: row.id,
      reference: row.reference,
      status: row.status,
      outboundAt: row.outboundAt.toISOString(),
      routeLabel: row.routeLabel,
      totalMinor: row.totalMinor,
      currency: row.currency,
      customerName: `${row.customerFirstName} ${row.customerLastName}`.trim(),
    }));
  }
}
