"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";

import {
  HOME_TESTIMONIAL_SLOT_INDICES,
} from "@/config/home-testimonials";
import { isSupportedLocaleCode } from "@/config/locales";
import { db } from "@/db/client";
import { HomeTestimonialRepository } from "@/features/testimonials/server/repository";
import { createAction } from "@/server/action";

const homeTestimonialRepository = new HomeTestimonialRepository(db);

const testimonialItemSchema = z.object({
  id: z.string().uuid().optional(),
  locale: z.string().trim().min(2).max(5),
  slotIndex: z.number().int().min(0).max(2),
  firstName: z.string().trim().max(64),
  lastName: z.string().trim().max(64),
  quote: z.string().trim().max(2000),
  rating: z.number().int().min(1).max(5),
  isActive: z.boolean(),
});

const updateHomeTestimonialsSchema = z
  .object({
    testimonials: z.array(testimonialItemSchema),
  })
  .superRefine((data, ctx) => {
    data.testimonials.forEach((item, index) => {
      if (!isSupportedLocaleCode(item.locale)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Geçersiz dil kodu",
          path: ["testimonials", index, "locale"],
        });
      }

      if (
        !HOME_TESTIMONIAL_SLOT_INDICES.includes(
          item.slotIndex as (typeof HOME_TESTIMONIAL_SLOT_INDICES)[number],
        )
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Geçersiz yorum sırası",
          path: ["testimonials", index, "slotIndex"],
        });
      }

      if (!item.isActive) {
        return;
      }

      if (!item.firstName.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Aktif yorum için isim zorunludur",
          path: ["testimonials", index, "firstName"],
        });
      }

      if (!item.quote.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Aktif yorum için metin zorunludur",
          path: ["testimonials", index, "quote"],
        });
      }
    });
  });

export async function updateHomeTestimonialsAction(rawInput: unknown) {
  return createAction(updateHomeTestimonialsSchema, async (input) => {
    const testimonials = await homeTestimonialRepository.upsertAll(
      input.testimonials.map((item) => ({
        id: item.id,
        locale: item.locale,
        slotIndex: item.slotIndex,
        firstName: item.firstName,
        lastName: item.lastName,
        quote: item.quote,
        rating: item.rating,
        isActive: item.isActive,
      })),
    );

    revalidatePath("/admin/testimonials");
    revalidateTag("home-testimonials", "max");

    return testimonials;
  }, rawInput);
}
