import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  Car,
  MapPin,
  MessageSquareText,
  Package,
  Receipt,
  Route,
  User,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ReservationStatusBadge } from "@/features/admin/components/ReservationStatusBadge";
import { ReservationStatusControl } from "@/features/admin/components/reservations/ReservationStatusControl";
import { formatReservationOutboundDate } from "@/features/admin/lib/format-admin-datetime";
import type { AdminReservationDetail } from "@/features/admin/server/reservation-admin-repository";
import { ADMIN_LOCALE, adminCopy, formatTripType } from "@/features/admin/copy";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";

type ReservationDetailViewProps = {
  reservation: AdminReservationDetail;
};

type DetailSectionProps = {
  title: string;
  description?: string;
  icon: LucideIcon;
  children: React.ReactNode;
  className?: string;
};

type DetailFactProps = {
  label: string;
  value: React.ReactNode;
  className?: string;
};

function DetailSection({
  title,
  description,
  icon: Icon,
  children,
  className,
}: DetailSectionProps) {
  return (
    <section
      className={cn(
        "admin-content-card overflow-hidden rounded-xl border bg-white",
        className,
      )}
    >
      <div className="flex items-start gap-3 border-b border-slate-100 bg-slate-50/80 px-5 py-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-600/20">
          <Icon className="h-5 w-5" aria-hidden />
        </div>
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-slate-900">{title}</h2>
          {description ? (
            <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
              {description}
            </p>
          ) : null}
        </div>
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function DetailFact({ label, value, className }: DetailFactProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1 border-b border-slate-100 py-3 last:border-b-0 sm:flex-row sm:items-start sm:justify-between sm:gap-4",
        className,
      )}
    >
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </dt>
      <dd className="text-sm font-medium text-slate-900 sm:max-w-[65%] sm:text-right">
        {value}
      </dd>
    </div>
  );
}

function SummaryStatCard({
  label,
  value,
  icon: Icon,
  accentClassName,
}: {
  label: string;
  value: React.ReactNode;
  icon: LucideIcon;
  accentClassName: string;
}) {
  return (
    <div className="admin-content-card rounded-xl border bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {label}
          </p>
          <p className="mt-2 text-lg font-semibold leading-tight text-slate-900">
            {value}
          </p>
        </div>
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
            accentClassName,
          )}
        >
          <Icon className="h-5 w-5" aria-hidden />
        </div>
      </div>
    </div>
  );
}

function formatCreatedAt(date: Date): string {
  return new Intl.DateTimeFormat(ADMIN_LOCALE, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatPrice(amountMinor: number, currency: string): string {
  return formatMoney({ amountMinor, currency }, ADMIN_LOCALE);
}

export function ReservationDetailView({ reservation }: ReservationDetailViewProps) {
  const vehicles = reservation.items.filter(
    (item) => item.itemType === "TRANSFER_VEHICLE",
  );
  const extras = reservation.items.filter(
    (item) => item.itemType === "EXTRA_SERVICE",
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <Link
            href="/admin/reservations"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            {adminCopy.reservations.backToList}
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
              {reservation.reference}
            </h1>
            <ReservationStatusBadge status={reservation.status} />
          </div>
          <p className="max-w-2xl text-sm text-slate-500">
            {adminCopy.reservations.detailSubtitle}
          </p>
        </div>
      </div>

      <ReservationStatusControl
        reservationId={reservation.id}
        currentStatus={reservation.status}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryStatCard
          label={adminCopy.reservations.table.outboundDate}
          value={formatReservationOutboundDate(reservation.outboundAt)}
          icon={CalendarDays}
          accentClassName="bg-blue-50 text-blue-600"
        />
        <SummaryStatCard
          label={adminCopy.reservations.fields.total}
          value={formatPrice(reservation.totalMinor, reservation.currency)}
          icon={Receipt}
          accentClassName="bg-emerald-50 text-emerald-600"
        />
        <SummaryStatCard
          label={adminCopy.reservations.fields.passengers}
          value={reservation.passengerCount}
          icon={Users}
          accentClassName="bg-violet-50 text-violet-600"
        />
        <SummaryStatCard
          label={adminCopy.reservations.fields.tripType}
          value={formatTripType(reservation.tripType)}
          icon={Route}
          accentClassName="bg-amber-50 text-amber-600"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <DetailSection
          title={adminCopy.reservations.detail.journey}
          description={adminCopy.reservations.detail.journeyHint}
          icon={CalendarDays}
        >
          <dl>
            <DetailFact
              label={adminCopy.reservations.fields.tripType}
              value={formatTripType(reservation.tripType)}
            />
            <DetailFact
              label={adminCopy.reservations.fields.outbound}
              value={formatReservationOutboundDate(reservation.outboundAt)}
            />
            {reservation.returnAt ? (
              <DetailFact
                label={adminCopy.reservations.fields.return}
                value={formatReservationOutboundDate(reservation.returnAt)}
              />
            ) : null}
            <DetailFact
              label={adminCopy.reservations.fields.passengers}
              value={reservation.passengerCount}
            />
            <DetailFact
              label={adminCopy.reservations.detail.largeLuggage}
              value={reservation.largeLuggageCount}
            />
            <DetailFact
              label={adminCopy.reservations.detail.cabinLuggage}
              value={reservation.cabinLuggageCount}
            />
            {reservation.outboundFlightNumber ? (
              <DetailFact
                label={adminCopy.reservations.fields.outboundFlight}
                value={reservation.outboundFlightNumber}
              />
            ) : null}
            {reservation.returnFlightNumber ? (
              <DetailFact
                label={adminCopy.reservations.fields.returnFlight}
                value={reservation.returnFlightNumber}
              />
            ) : null}
            <DetailFact
              label={adminCopy.reservations.detail.createdAt}
              value={formatCreatedAt(reservation.createdAt)}
            />
          </dl>
        </DetailSection>

        <DetailSection
          title={adminCopy.reservations.detail.customer}
          description={adminCopy.reservations.detail.customerHint}
          icon={User}
        >
          <dl>
            <DetailFact
              label={adminCopy.reservations.fields.name}
              value={reservation.customerName}
            />
            <DetailFact
              label={adminCopy.reservations.fields.email}
              value={
                <a
                  href={`mailto:${reservation.customerEmail}`}
                  className="text-blue-600 hover:underline"
                >
                  {reservation.customerEmail}
                </a>
              }
            />
            <DetailFact
              label={adminCopy.reservations.fields.phone}
              value={
                <a
                  href={`tel:${reservation.customerPhone.replace(/\s/g, "")}`}
                  className="text-blue-600 hover:underline"
                >
                  {reservation.customerPhone}
                </a>
              }
            />
            {reservation.customerWhatsappPhone ? (
              <DetailFact
                label={adminCopy.reservations.detail.whatsapp}
                value={
                  <a
                    href={`https://wa.me/${reservation.customerWhatsappPhone.replace(/\D/g, "")}`}
                    className="text-blue-600 hover:underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {reservation.customerWhatsappPhone}
                  </a>
                }
              />
            ) : null}
          </dl>
        </DetailSection>

        <DetailSection
          title={adminCopy.reservations.detail.route}
          description={adminCopy.reservations.detail.routeHint}
          icon={MapPin}
          className="xl:col-span-2"
        >
          <div className="mb-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-3 text-sm font-medium text-slate-900">
              <Route className="h-4 w-4 shrink-0 text-blue-600" aria-hidden />
              {reservation.snapshotRouteLabel}
            </div>
          </div>
          <dl className="grid gap-0 md:grid-cols-2 md:gap-x-8">
            <DetailFact
              label={adminCopy.reservations.table.origin}
              value={reservation.originName}
            />
            <DetailFact
              label={adminCopy.reservations.table.pricingDestination}
              value={reservation.pricingDestinationName}
            />
            <DetailFact
              label={adminCopy.reservations.table.actualDropoff}
              value={reservation.actualDropoffLabel}
            />
            {reservation.hotelName ? (
              <DetailFact
                label={adminCopy.reservations.fields.hotel}
                value={reservation.hotelName}
              />
            ) : null}
            {reservation.customDestinationName ? (
              <DetailFact
                label={adminCopy.reservations.fields.customDestination}
                value={reservation.customDestinationName}
              />
            ) : null}
            {reservation.customDestinationAddress ? (
              <DetailFact
                label={adminCopy.reservations.fields.customAddress}
                value={reservation.customDestinationAddress}
                className="md:col-span-2"
              />
            ) : null}
            {reservation.snapshotDropoffLabel ? (
              <DetailFact
                label={adminCopy.reservations.fields.dropoffSnapshot}
                value={reservation.snapshotDropoffLabel}
              />
            ) : null}
          </dl>
        </DetailSection>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <DetailSection
          title={adminCopy.reservations.detail.vehicles}
          description={adminCopy.reservations.detail.vehiclesHint}
          icon={Car}
        >
          {vehicles.length === 0 ? (
            <p className="text-sm text-slate-500">
              {adminCopy.reservations.detail.noVehicles}
            </p>
          ) : (
            <div className="space-y-4">
              {vehicles.map((vehicle, index) => (
                <div
                  key={`${vehicle.snapshotName}-${index}`}
                  className="overflow-hidden rounded-xl border border-slate-200"
                >
                  {vehicle.imageUrl ? (
                    <div className="relative aspect-[16/7] bg-slate-100">
                      <Image
                        src={vehicle.imageUrl}
                        alt={vehicle.snapshotName}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    </div>
                  ) : null}
                  <div className="flex items-start justify-between gap-3 p-4">
                    <div>
                      <p className="font-semibold text-slate-900">
                        {vehicle.snapshotName}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {adminCopy.reservations.table.qty}: {vehicle.quantity}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-slate-900">
                      {formatPrice(
                        vehicle.totalPriceMinor,
                        reservation.currency,
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DetailSection>

        <DetailSection
          title={adminCopy.reservations.detail.extras}
          description={adminCopy.reservations.detail.extrasHint}
          icon={Package}
        >
          {extras.length === 0 ? (
            <p className="text-sm text-slate-500">
              {adminCopy.reservations.detail.noExtras}
            </p>
          ) : (
            <div className="space-y-3">
              {extras.map((extra, index) => (
                <div
                  key={`${extra.snapshotName}-${index}`}
                  className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900">
                      {extra.snapshotName}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {adminCopy.reservations.table.qty}: {extra.quantity}
                    </p>
                  </div>
                  {extra.totalPriceMinor === 0 ? (
                    <Badge variant="success">
                      {adminCopy.reservations.detail.included}
                    </Badge>
                  ) : (
                    <span className="text-sm font-semibold text-slate-900">
                      {formatPrice(
                        extra.totalPriceMinor,
                        reservation.currency,
                      )}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </DetailSection>
      </div>

      <DetailSection
        title={adminCopy.reservations.detail.pricing}
        description={adminCopy.reservations.detail.pricingHint}
        icon={Receipt}
      >
        <Table className="admin-table">
          <TableHeader>
            <TableRow>
              <TableHead>{adminCopy.reservations.table.item}</TableHead>
              <TableHead>{adminCopy.reservations.table.qty}</TableHead>
              <TableHead>{adminCopy.reservations.table.unit}</TableHead>
              <TableHead className="text-right">
                {adminCopy.reservations.table.total}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reservation.items.map((item, index) => (
              <TableRow key={`${item.snapshotName}-${index}`}>
                <TableCell className="font-medium">{item.snapshotName}</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>
                  {item.totalPriceMinor === 0
                    ? adminCopy.reservations.detail.included
                    : formatPrice(item.unitPriceMinor, reservation.currency)}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {item.totalPriceMinor === 0
                    ? adminCopy.reservations.detail.included
                    : formatPrice(item.totalPriceMinor, reservation.currency)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="mt-5 flex flex-col gap-2 border-t border-slate-100 pt-4 sm:ml-auto sm:max-w-sm">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">
              {adminCopy.reservations.fields.subtotal}
            </span>
            <span className="font-medium text-slate-900">
              {formatPrice(reservation.subtotalMinor, reservation.currency)}
            </span>
          </div>
          <div className="flex items-center justify-between border-t border-slate-100 pt-3">
            <span className="text-sm font-semibold text-slate-900">
              {adminCopy.reservations.fields.total}
            </span>
            <span className="text-xl font-semibold text-slate-900">
              {formatPrice(reservation.totalMinor, reservation.currency)}
            </span>
          </div>
        </div>
      </DetailSection>

      <DetailSection
        title={adminCopy.reservations.detail.notes}
        description={adminCopy.reservations.detail.notesHint}
        icon={MessageSquareText}
      >
        {reservation.notes ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50/70 px-4 py-4 text-sm leading-relaxed text-slate-800">
            {reservation.notes}
          </div>
        ) : (
          <p className="text-sm text-slate-500">
            {adminCopy.reservations.detail.notesEmpty}
          </p>
        )}
      </DetailSection>
    </div>
  );
}
