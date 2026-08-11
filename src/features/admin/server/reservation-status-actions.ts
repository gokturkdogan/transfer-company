"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db/client";
import { RESERVATION_STATUSES } from "@/db/schema/enums";
import { requireAdminSession } from "@/features/admin/server/auth";
import { ReservationAdminRepository } from "@/features/admin/server/reservation-admin-repository";
import { buildReservationNotificationPayloadFromAdminDetail } from "@/server/notifications/build-reservation-notification-payload-from-detail";
import { notificationService } from "@/server/notifications/create-notification-service";
import { createAction } from "@/server/action";
import { logger } from "@/server/logger";

const reservationAdminRepository = new ReservationAdminRepository(db);

const updateReservationStatusSchema = z.object({
  reservationId: z.string().uuid(),
  status: z.enum(RESERVATION_STATUSES),
});

export async function updateReservationStatusAction(rawInput: unknown) {
  await requireAdminSession();

  return createAction(updateReservationStatusSchema, async (input) => {
    const current = await reservationAdminRepository.getReservationById(
      input.reservationId,
    );

    if (current.status === input.status) {
      return {
        status: current.status,
        emailSent: false,
        unchanged: true,
      };
    }

    const previousStatus = current.status;
    const updated = await reservationAdminRepository.updateReservationStatus(
      input.reservationId,
      input.status,
    );

    const payload = buildReservationNotificationPayloadFromAdminDetail(updated);
    let emailSent = false;

    try {
      await notificationService.sendReservationStatusUpdate({
        ...payload,
        previousStatus,
        nextStatus: input.status,
      });
      emailSent = true;
    } catch (error) {
      logger.error("Failed to send reservation status email", {
        reservationId: input.reservationId,
        reference: updated.reference,
        previousStatus,
        nextStatus: input.status,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }

    revalidatePath("/admin/reservations");
    revalidatePath(`/admin/reservations/${input.reservationId}`);

    return {
      status: updated.status,
      emailSent,
      unchanged: false,
    };
  }, rawInput);
}
