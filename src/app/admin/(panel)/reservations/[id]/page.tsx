import { notFound } from "next/navigation";

import { db } from "@/db/client";
import { ReservationDetailView } from "@/features/admin/components/reservations/ReservationDetailView";
import { ReservationAdminRepository } from "@/features/admin/server/reservation-admin-repository";

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

  return <ReservationDetailView reservation={reservation} />;
}
