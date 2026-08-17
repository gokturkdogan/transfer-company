import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Car,
  MessageSquareText,
  Receipt,
  Route,
  User,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { ReservationStatusBadge } from "@/features/admin/components/ReservationStatusBadge";
import { ReservationPdfExportButton } from "@/features/admin/components/reservations/ReservationPdfExportButton";
import { ReservationStatusControl } from "@/features/admin/components/reservations/ReservationStatusControl";
import { formatReservationOutboundDate } from "@/features/admin/lib/format-admin-datetime";
import {
  partitionReservationLineItems,
  resolveReservationLuggageCount,
} from "@/features/admin/lib/partition-reservation-items";
import type { AdminReservationDetail } from "@/features/admin/server/reservation-admin-repository";
import { ADMIN_LOCALE, adminCopy, formatTripType } from "@/features/admin/copy";
import {
  formatPassengerDisplayLine,
  resolvePassengerKindLabel,
} from "@/features/booking/lib/passenger-details";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";

type ReservationDetailViewProps = {
  reservation: AdminReservationDetail;
};

function InfoCard({
  title,
  icon: Icon,
  children,
  className,
}: {
  title: string;
  icon: LucideIcon;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-xl border border-slate-200 bg-white shadow-sm",
        className,
      )}
    >
      <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-3.5">
        <Icon className="h-4 w-4 text-slate-500" aria-hidden />
        <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
      </div>
      <div className="px-5 py-4">{children}</div>
    </section>
  );
}

function FactGrid({
  items,
}: {
  items: Array<{ label: string; value: React.ReactNode }>;
}) {
  return (
    <dl className="grid gap-3 sm:grid-cols-2">
      {items.map((item) => (
        <div key={item.label} className="min-w-0">
          <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            {item.label}
          </dt>
          <dd className="mt-1 text-sm font-medium text-slate-900">{item.value}</dd>
        </div>
      ))}
    </dl>
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

function PriceRow({
  label,
  detail,
  amountMinor,
  currency,
  included = false,
}: {
  label: string;
  detail?: string;
  amountMinor: number;
  currency: string;
  included?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-3 py-2.5">
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-900">{label}</p>
        {detail ? (
          <p className="mt-0.5 text-xs text-slate-500">{detail}</p>
        ) : null}
      </div>
      {included ? (
        <Badge variant="success" className="shrink-0">
          {adminCopy.reservations.detail.included}
        </Badge>
      ) : (
        <span className="shrink-0 text-sm font-semibold text-slate-900">
          {formatPrice(amountMinor, currency)}
        </span>
      )}
    </div>
  );
}

export function ReservationDetailView({ reservation }: ReservationDetailViewProps) {
  const { transferVehicles, extraLines } = partitionReservationLineItems(
    reservation.items,
  );
  const luggageCount = resolveReservationLuggageCount(
    reservation.largeLuggageCount,
    reservation.cabinLuggageCount,
  );

  const transferFacts: Array<{ label: string; value: React.ReactNode }> = [
    {
      label: adminCopy.reservations.fields.tripType,
      value: formatTripType(reservation.tripType),
    },
    {
      label: adminCopy.reservations.fields.outbound,
      value: formatReservationOutboundDate(reservation.outboundAt),
    },
    {
      label: adminCopy.reservations.fields.passengers,
      value: reservation.passengerCount,
    },
    {
      label: adminCopy.reservations.detail.luggage,
      value: luggageCount,
    },
    {
      label: adminCopy.reservations.detail.createdAt,
      value: formatCreatedAt(reservation.createdAt),
    },
  ];

  if (reservation.returnAt) {
    transferFacts.splice(2, 0, {
      label: adminCopy.reservations.fields.return,
      value: formatReservationOutboundDate(reservation.returnAt),
    });
  }

  if (reservation.outboundFlightNumber) {
    transferFacts.push({
      label: adminCopy.reservations.fields.outboundFlight,
      value: reservation.outboundFlightNumber,
    });
  }

  if (reservation.returnFlightNumber) {
    transferFacts.push({
      label: adminCopy.reservations.fields.returnFlight,
      value: reservation.returnFlightNumber,
    });
  }

  const routeFacts: Array<{ label: string; value: React.ReactNode }> = [
    {
      label: adminCopy.reservations.table.origin,
      value: reservation.originName,
    },
    {
      label: adminCopy.reservations.table.pricingDestination,
      value: reservation.pricingDestinationName,
    },
    {
      label: adminCopy.reservations.table.actualDropoff,
      value: reservation.actualDropoffLabel,
    },
  ];

  if (reservation.hotelName) {
    routeFacts.push({
      label: adminCopy.reservations.fields.hotel,
      value: reservation.hotelName,
    });
  }

  if (reservation.customDestinationName) {
    routeFacts.push({
      label: adminCopy.reservations.fields.customDestination,
      value: reservation.customDestinationName,
    });
  }

  if (reservation.customDestinationAddress) {
    routeFacts.push({
      label: adminCopy.reservations.fields.customAddress,
      value: reservation.customDestinationAddress,
    });
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Link
          href="/admin/reservations"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {adminCopy.reservations.backToList}
        </Link>

        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            {reservation.reference}
          </h1>
          <ReservationStatusBadge status={reservation.status} />
          <span className="text-sm font-semibold text-emerald-700">
            {formatPrice(reservation.totalMinor, reservation.currency)}
          </span>
          <ReservationPdfExportButton reservationId={reservation.id} />
        </div>
      </div>

      <ReservationStatusControl
        reservationId={reservation.id}
        currentStatus={reservation.status}
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <div className="space-y-6">
          <InfoCard
            title={adminCopy.reservations.detail.transferSummary}
            icon={Route}
          >
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-sm font-semibold text-slate-900">
                {reservation.snapshotRouteLabel}
              </p>
            </div>

            <div className="mt-4">
              <FactGrid items={transferFacts} />
            </div>

            {routeFacts.length > 0 ? (
              <div className="mt-5 border-t border-slate-100 pt-4">
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  {adminCopy.reservations.detail.route}
                </p>
                <FactGrid items={routeFacts} />
              </div>
            ) : null}
          </InfoCard>

          <InfoCard title={adminCopy.reservations.detail.customer} icon={User}>
            <FactGrid
              items={[
                {
                  label: adminCopy.reservations.fields.name,
                  value: reservation.customerName,
                },
                {
                  label: adminCopy.reservations.fields.email,
                  value: (
                    <a
                      href={`mailto:${reservation.customerEmail}`}
                      className="text-blue-600 hover:underline"
                    >
                      {reservation.customerEmail}
                    </a>
                  ),
                },
                {
                  label: adminCopy.reservations.fields.phone,
                  value: (
                    <a
                      href={`tel:${reservation.customerPhone.replace(/\s/g, "")}`}
                      className="text-blue-600 hover:underline"
                    >
                      {reservation.customerPhone}
                    </a>
                  ),
                },
                ...(reservation.customerWhatsappPhone
                  ? [
                      {
                        label: adminCopy.reservations.detail.whatsapp,
                        value: (
                          <a
                            href={`https://wa.me/${reservation.customerWhatsappPhone.replace(/\D/g, "")}`}
                            className="text-blue-600 hover:underline"
                            target="_blank"
                            rel="noreferrer"
                          >
                            {reservation.customerWhatsappPhone}
                          </a>
                        ),
                      },
                    ]
                  : []),
              ]}
            />
          </InfoCard>

          <InfoCard
            title={adminCopy.reservations.detail.passengerDetails}
            icon={Users}
          >
            {reservation.passengerDetails &&
            reservation.passengerDetails.length > 0 ? (
              <ul className="space-y-2 text-sm text-slate-800">
                {reservation.passengerDetails.map((passenger) => {
                  const kindLabel = resolvePassengerKindLabel(passenger, {
                    adult: adminCopy.reservations.detail.passengerAdult,
                    child: adminCopy.reservations.detail.passengerChild,
                    infant: adminCopy.reservations.detail.passengerInfant,
                  });

                  return (
                    <li
                      key={`${passenger.kind}-${passenger.index}`}
                      className="rounded-lg border border-slate-100 bg-slate-50/80 px-3 py-2"
                    >
                      {formatPassengerDisplayLine(passenger, kindLabel)}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-sm text-slate-500">
                {adminCopy.reservations.detail.passengerDetailsEmpty}
              </p>
            )}
          </InfoCard>

          {reservation.notes ? (
            <InfoCard
              title={adminCopy.reservations.detail.notes}
              icon={MessageSquareText}
            >
              <div className="whitespace-pre-wrap rounded-lg border border-amber-200 bg-amber-50/70 px-4 py-3 text-sm leading-relaxed text-slate-800">
                {reservation.notes}
              </div>
            </InfoCard>
          ) : null}
        </div>

        <div className="space-y-6">
          <InfoCard
            title={adminCopy.reservations.detail.pricingSummary}
            icon={Receipt}
            className="lg:sticky lg:top-6"
          >
            <div className="space-y-4">
              <div>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  {adminCopy.reservations.detail.pricingVehicles}
                </p>
                {transferVehicles.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    {adminCopy.reservations.detail.noVehicles}
                  </p>
                ) : (
                  <div className="space-y-3">
                    {transferVehicles.map((vehicle, index) => (
                      <div
                        key={`${vehicle.snapshotName}-${index}`}
                        className="flex gap-3 rounded-lg border border-slate-200 p-3"
                      >
                        {vehicle.imageUrl ? (
                          <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-md bg-slate-100">
                            <Image
                              src={vehicle.imageUrl}
                              alt={vehicle.snapshotName}
                              fill
                              className="object-cover"
                              sizes="80px"
                            />
                          </div>
                        ) : (
                          <div className="flex h-14 w-20 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-400">
                            <Car className="h-5 w-5" aria-hidden />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <PriceRow
                            label={vehicle.snapshotName}
                            detail={`${adminCopy.reservations.table.qty}: ${vehicle.quantity}`}
                            amountMinor={vehicle.totalPriceMinor}
                            currency={reservation.currency}
                            included={vehicle.totalPriceMinor === 0}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {extraLines.length > 0 ? (
                <div className="border-t border-slate-100 pt-4">
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    {adminCopy.reservations.detail.pricingExtras}
                  </p>
                  <div className="divide-y divide-slate-100">
                    {extraLines.map((extra, index) => (
                      <PriceRow
                        key={`${extra.snapshotName}-${index}`}
                        label={
                          extra.isLuggageOverflowVehicle
                            ? adminCopy.reservations.detail.luggageVehicle
                            : extra.snapshotName
                        }
                        detail={
                          extra.isLuggageOverflowVehicle
                            ? `${extra.snapshotName} · ${adminCopy.reservations.table.qty}: ${extra.quantity}`
                            : `${adminCopy.reservations.table.qty}: ${extra.quantity}`
                        }
                        amountMinor={extra.totalPriceMinor}
                        currency={reservation.currency}
                        included={extra.totalPriceMinor === 0}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <p className="border-t border-slate-100 pt-4 text-sm text-slate-500">
                  {adminCopy.reservations.detail.noExtras}
                </p>
              )}

              <div className="space-y-2 border-t border-slate-100 pt-4">
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
                  <span className="text-lg font-semibold text-slate-900">
                    {formatPrice(reservation.totalMinor, reservation.currency)}
                  </span>
                </div>
              </div>
            </div>
          </InfoCard>
        </div>
      </div>
    </div>
  );
}
