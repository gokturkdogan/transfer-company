import "server-only";

import { and, count, desc, eq, ne, sql } from "drizzle-orm";

import { SUPPORTED_CURRENCIES } from "@/config/currencies";
import type { Database } from "@/db/client";
import {
  customers,
  reservationItems,
  reservations,
} from "@/db/schema";

export type DashboardCurrencyStats = {
  currency: string;
  label: string;
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
  currencyStats: DashboardCurrencyStats[];
  vehicleBreakdown: DashboardBreakdownItem[];
  routeBreakdown: DashboardBreakdownItem[];
  weeklyTrend: DashboardTrendPoint[];
  monthlyTrend: DashboardTrendPoint[];
  statusBreakdown: DashboardBreakdownItem[];
  currencyDistribution: DashboardBreakdownItem[];
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
      currencyRows,
      vehicleRows,
      routeRows,
      weeklyRows,
      monthlyRows,
      statusRows,
      currencyDistributionRows,
      weekdayRows,
      recentRows,
    ] = await Promise.all([
      this.loadSummary(),
      this.loadCurrencyStats(),
      this.loadVehicleBreakdown(),
      this.loadRouteBreakdown(),
      this.loadWeeklyTrend(),
      this.loadMonthlyTrend(),
      this.loadStatusBreakdown(),
      this.loadCurrencyDistribution(),
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
      currencyStats: this.mergeCurrencyStats(currencyRows),
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
      currencyDistribution: currencyDistributionRows.map((row) => ({
        name: row.currency,
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

  private async loadCurrencyStats() {
    return this.database
      .select({
        currency: reservations.currency,
        totalMinor: sql<number>`coalesce(sum(${reservations.totalMinor}) filter (where ${reservations.status} <> 'CANCELLED'), 0)`,
        upcomingMinor: sql<number>`coalesce(sum(${reservations.totalMinor}) filter (where ${reservations.status} in ('PENDING', 'CONFIRMED') and ${reservations.outboundAt} > now()), 0)`,
        completedMinor: sql<number>`coalesce(sum(${reservations.totalMinor}) filter (where ${reservations.status} <> 'CANCELLED' and (${reservations.status} = 'COMPLETED' or ${reservations.outboundAt} <= now())), 0)`,
        cancelledMinor: sql<number>`coalesce(sum(${reservations.totalMinor}) filter (where ${reservations.status} = 'CANCELLED'), 0)`,
        totalCount: sql<number>`count(*) filter (where ${reservations.status} <> 'CANCELLED')`,
        upcomingCount: sql<number>`count(*) filter (where ${reservations.status} in ('PENDING', 'CONFIRMED') and ${reservations.outboundAt} > now())`,
        completedCount: sql<number>`count(*) filter (where ${reservations.status} <> 'CANCELLED' and (${reservations.status} = 'COMPLETED' or ${reservations.outboundAt} <= now()))`,
        cancelledCount: sql<number>`count(*) filter (where ${reservations.status} = 'CANCELLED')`,
      })
      .from(reservations)
      .groupBy(reservations.currency);
  }

  private mergeCurrencyStats(
    rows: Awaited<ReturnType<DashboardAdminRepository["loadCurrencyStats"]>>,
  ): DashboardCurrencyStats[] {
    const byCurrency = new Map(
      rows.map((row) => [
        row.currency,
        {
          currency: row.currency,
          label:
            SUPPORTED_CURRENCIES.find((currency) => currency.code === row.currency)
              ?.label ?? row.currency,
          totalMinor: toNumber(row.totalMinor),
          upcomingMinor: toNumber(row.upcomingMinor),
          completedMinor: toNumber(row.completedMinor),
          cancelledMinor: toNumber(row.cancelledMinor),
          totalCount: toNumber(row.totalCount),
          upcomingCount: toNumber(row.upcomingCount),
          completedCount: toNumber(row.completedCount),
          cancelledCount: toNumber(row.cancelledCount),
        },
      ]),
    );

    return SUPPORTED_CURRENCIES.map((supported) => {
      const existing = byCurrency.get(supported.code);
      if (existing) {
        return existing;
      }

      return {
        currency: supported.code,
        label: supported.label,
        totalMinor: 0,
        upcomingMinor: 0,
        completedMinor: 0,
        cancelledMinor: 0,
        totalCount: 0,
        upcomingCount: 0,
        completedCount: 0,
        cancelledCount: 0,
      };
    });
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
        revenueMinor: sql<number>`coalesce(sum(${reservations.totalMinor}) filter (where ${reservations.status} <> 'CANCELLED'), 0)`,
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
        revenueMinor: sql<number>`coalesce(sum(${reservations.totalMinor}) filter (where ${reservations.status} <> 'CANCELLED'), 0)`,
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

  private async loadCurrencyDistribution() {
    return this.database
      .select({
        currency: reservations.currency,
        count: count(),
      })
      .from(reservations)
      .where(ne(reservations.status, "CANCELLED"))
      .groupBy(reservations.currency)
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
