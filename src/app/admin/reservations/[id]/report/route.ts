import { NextResponse } from "next/server";

import { db } from "@/db/client";
import {
  buildReservationPdfBuffer,
  buildReservationPdfFilename,
} from "@/features/admin/server/build-reservation-pdf";
import { requireAdminApiSession } from "@/features/admin/server/auth";
import { ReservationAdminRepository } from "@/features/admin/server/reservation-admin-repository";
import { isAppError, toPublicError } from "@/server/errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const reservationRepository = new ReservationAdminRepository(db);

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdminApiSession();

    const { id } = await context.params;
    const reservation = await reservationRepository.getReservationById(id);
    const buffer = await buildReservationPdfBuffer(reservation);
    const filename = buildReservationPdfFilename(reservation.reference);

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    const status = isAppError(error) ? error.statusCode : 500;

    return NextResponse.json(toPublicError(error), { status });
  }
}
