"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { getCurrencyEmoji } from "@/config/currencies";
import { adminCopy, ADMIN_LOCALE, formatReservationStatus } from "@/features/admin/copy";
import type { DashboardData } from "@/features/admin/server/dashboard-admin-repository";
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
import { cn } from "@/lib/utils";

const CHART_COLORS = [
  "#2563eb",
  "#1d4ed8",
  "#3b82f6",
  "#60a5fa",
  "#0f172a",
  "#64748b",
  "#93c5fd",
  "#1e40af",
];

type TrendMode = "weekly" | "monthly";

function formatMinor(amountMinor: number, currency: string): string {
  return formatMoney({ amountMinor, currency }, ADMIN_LOCALE);
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat(ADMIN_LOCALE, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function ChartEmptyState() {
  return (
    <div className="flex h-56 items-center justify-center text-sm text-muted-foreground">
      {adminCopy.dashboard.charts.empty}
    </div>
  );
}

function formatCurrencyDisplay(code: string): string {
  return `${getCurrencyEmoji(code)} ${code}`;
}

function CurrencyCard({
  currency,
  totalMinor,
  upcomingMinor,
  completedMinor,
  cancelledMinor,
  totalCount,
  upcomingCount,
  completedCount,
  cancelledCount,
}: DashboardData["currencyStats"][number]) {
  const activeTotal = upcomingMinor + completedMinor;
  const upcomingShare =
    activeTotal > 0 ? Math.round((upcomingMinor / activeTotal) * 100) : 0;
  const completedShare =
    activeTotal > 0 ? Math.round((completedMinor / activeTotal) * 100) : 0;
  const totalFormatted = formatMinor(totalMinor, currency);

  return (
    <div className="admin-content-card min-w-0 rounded-lg border p-2.5">
      <div className="flex items-center gap-1.5">
        <span className="text-sm leading-none" aria-hidden>
          {getCurrencyEmoji(currency)}
        </span>
        <span className="text-xs font-semibold">{currency}</span>
        <span className="ms-auto text-[10px] tabular-nums text-muted-foreground">
          {totalCount}
        </span>
      </div>

      <p
        className="mt-1 truncate text-base font-semibold leading-tight"
        title={totalFormatted}
      >
        {totalFormatted}
      </p>

      <div className="mt-2 flex h-1 overflow-hidden rounded-full bg-muted">
        {upcomingShare > 0 ? (
          <div
            className="bg-accent"
            style={{ width: `${upcomingShare}%` }}
            title={adminCopy.dashboard.currencySection.upcoming}
          />
        ) : null}
        {completedShare > 0 ? (
          <div
            className="bg-foreground/70"
            style={{ width: `${completedShare}%` }}
            title={adminCopy.dashboard.currencySection.completed}
          />
        ) : null}
      </div>

      <dl className="mt-2 grid grid-cols-3 gap-1 text-[10px] leading-tight">
        <div className="min-w-0">
          <dt className="truncate text-muted-foreground">
            {adminCopy.dashboard.currencySection.upcoming}
          </dt>
          <dd
            className="truncate font-medium"
            title={formatMinor(upcomingMinor, currency)}
          >
            {formatMinor(upcomingMinor, currency)}
          </dd>
          <dd className="text-muted-foreground">{upcomingCount}</dd>
        </div>
        <div className="min-w-0">
          <dt className="truncate text-muted-foreground">
            {adminCopy.dashboard.currencySection.completed}
          </dt>
          <dd
            className="truncate font-medium"
            title={formatMinor(completedMinor, currency)}
          >
            {formatMinor(completedMinor, currency)}
          </dd>
          <dd className="text-muted-foreground">{completedCount}</dd>
        </div>
        <div className="min-w-0">
          <dt className="truncate text-muted-foreground">
            {adminCopy.dashboard.currencySection.cancelled}
          </dt>
          <dd
            className="truncate font-medium"
            title={formatMinor(cancelledMinor, currency)}
          >
            {formatMinor(cancelledMinor, currency)}
          </dd>
          <dd className="text-muted-foreground">{cancelledCount}</dd>
        </div>
      </dl>
    </div>
  );
}

export function AdminDashboard({ data }: { data: DashboardData }) {
  const [trendMode, setTrendMode] = useState<TrendMode>("weekly");

  const trendData =
    trendMode === "weekly" ? data.weeklyTrend : data.monthlyTrend;

  const statusChartData = useMemo(
    () =>
      data.statusBreakdown.map((item) => ({
        name: formatReservationStatus(item.name),
        value: item.count,
        rawStatus: item.name,
      })),
    [data.statusBreakdown],
  );

  const vehicleChartData = useMemo(
    () =>
      data.vehicleBreakdown.map((item) => ({
        name: item.name,
        value: item.count,
      })),
    [data.vehicleBreakdown],
  );

  const currencyChartData = useMemo(
    () =>
      data.currencyDistribution.map((item) => ({
        name: formatCurrencyDisplay(item.name),
        value: item.count,
      })),
    [data.currencyDistribution],
  );

  const routeChartData = useMemo(
    () =>
      data.routeBreakdown.map((item) => ({
        name:
          item.name.length > 28 ? `${item.name.slice(0, 28)}…` : item.name,
        fullName: item.name,
        count: item.count,
      })),
    [data.routeBreakdown],
  );

  const weekdayChartData = data.weekdayBreakdown.map((item) => ({
    name: item.name.slice(0, 3),
    fullName: item.name,
    count: item.count,
  }));

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="admin-content-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {adminCopy.dashboard.kpi.totalReservations}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">
              {data.summary.totalReservations}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {adminCopy.dashboard.kpi.oneWay}: {data.summary.oneWayCount} ·{" "}
              {adminCopy.dashboard.kpi.roundTrip}: {data.summary.roundTripCount}
            </p>
          </CardContent>
        </Card>

        <Card className="admin-content-card border-t-4 border-t-sky-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {adminCopy.dashboard.kpi.upcoming}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">
              {data.summary.upcomingReservations}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {adminCopy.dashboard.kpi.completed}:{" "}
              {data.summary.completedReservations}
            </p>
          </CardContent>
        </Card>

        <Card className="admin-content-card border-t-4 border-t-red-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {adminCopy.dashboard.kpi.cancellationRate}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">
              %{data.summary.cancellationRate}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {adminCopy.dashboard.kpi.cancelled}:{" "}
              {data.summary.cancelledReservations}
            </p>
          </CardContent>
        </Card>

        <Card className="admin-content-card border-t-4 border-t-emerald-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {adminCopy.dashboard.kpi.totalPassengers}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">
              {data.summary.totalPassengers}
            </p>
          </CardContent>
        </Card>
      </div>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">
            {adminCopy.dashboard.currencySection.title}
          </h2>
          <p className="text-sm text-muted-foreground">
            {adminCopy.dashboard.currencySection.hint}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {data.currencyStats.map((currencyStat) => (
            <CurrencyCard key={currencyStat.currency} {...currencyStat} />
          ))}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="admin-content-card">
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <CardTitle className="text-base">
              {adminCopy.dashboard.charts.trendTitle}
            </CardTitle>
            <div className="flex rounded-md border border-border p-0.5">
              {(["weekly", "monthly"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  className={cn(
                    "cursor-pointer rounded px-3 py-1 text-xs font-medium transition-colors",
                    trendMode === mode
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                  onClick={() => setTrendMode(mode)}
                >
                  {mode === "weekly"
                    ? adminCopy.dashboard.charts.trendWeekly
                    : adminCopy.dashboard.charts.trendMonthly}
                </button>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            {trendData.length === 0 ? (
              <ChartEmptyState />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ececec" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="count"
                    name={adminCopy.dashboard.charts.trendCount}
                    stroke="#c8a45d"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="admin-content-card">
          <CardHeader>
            <CardTitle className="text-base">
              {adminCopy.dashboard.charts.vehiclesTitle}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {adminCopy.dashboard.charts.vehiclesHint}
            </p>
          </CardHeader>
          <CardContent>
            {vehicleChartData.length === 0 ? (
              <ChartEmptyState />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={vehicleChartData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                  >
                    {vehicleChartData.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="admin-content-card">
          <CardHeader>
            <CardTitle className="text-base">
              {adminCopy.dashboard.charts.routesTitle}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {adminCopy.dashboard.charts.routesHint}
            </p>
          </CardHeader>
          <CardContent>
            {routeChartData.length === 0 ? (
              <ChartEmptyState />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={routeChartData} layout="vertical" margin={{ left: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ececec" />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={120}
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip
                    formatter={(value) => [value, adminCopy.dashboard.charts.trendCount]}
                    labelFormatter={(_, payload) =>
                      payload?.[0]?.payload?.fullName ?? ""
                    }
                  />
                  <Bar dataKey="count" fill="#c8a45d" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="admin-content-card">
          <CardHeader>
            <CardTitle className="text-base">
              {adminCopy.dashboard.charts.statusTitle}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statusChartData.length === 0 ? (
              <ChartEmptyState />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={statusChartData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                  >
                    {statusChartData.map((entry, index) => (
                      <Cell
                        key={entry.rawStatus}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="admin-content-card">
          <CardHeader>
            <CardTitle className="text-base">
              {adminCopy.dashboard.charts.weekdayTitle}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {adminCopy.dashboard.charts.weekdayHint}
            </p>
          </CardHeader>
          <CardContent>
            {weekdayChartData.length === 0 ? (
              <ChartEmptyState />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={weekdayChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ececec" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip
                    labelFormatter={(_, payload) =>
                      payload?.[0]?.payload?.fullName ?? ""
                    }
                  />
                  <Bar dataKey="count" fill="#111111" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="admin-content-card">
          <CardHeader>
            <CardTitle className="text-base">
              {adminCopy.dashboard.charts.currencyTitle}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {adminCopy.dashboard.charts.currencyHint}
            </p>
          </CardHeader>
          <CardContent>
            {currencyChartData.length === 0 ? (
              <ChartEmptyState />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={currencyChartData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                  >
                    {currencyChartData.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">
            {adminCopy.dashboard.recent.title}
          </CardTitle>
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/reservations">
              {adminCopy.dashboard.recent.viewAll}
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{adminCopy.dashboard.recent.reference}</TableHead>
                <TableHead>{adminCopy.dashboard.recent.customer}</TableHead>
                <TableHead>{adminCopy.dashboard.recent.route}</TableHead>
                <TableHead>{adminCopy.dashboard.recent.date}</TableHead>
                <TableHead>{adminCopy.dashboard.recent.status}</TableHead>
                <TableHead className="text-right">
                  {adminCopy.dashboard.recent.total}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.recentReservations.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-muted-foreground"
                  >
                    {adminCopy.dashboard.charts.empty}
                  </TableCell>
                </TableRow>
              ) : (
                data.recentReservations.map((reservation) => (
                  <TableRow key={reservation.id}>
                    <TableCell>
                      <Link
                        href={`/admin/reservations/${reservation.id}`}
                        className="cursor-pointer font-medium hover:underline"
                      >
                        {reservation.reference}
                      </Link>
                    </TableCell>
                    <TableCell>{reservation.customerName}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {reservation.routeLabel}
                    </TableCell>
                    <TableCell>{formatDate(reservation.outboundAt)}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {formatReservationStatus(reservation.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {formatMinor(
                        reservation.totalMinor,
                        reservation.currency,
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
