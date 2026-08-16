import "server-only";

import { and, asc, eq } from "drizzle-orm";

import {
  HOME_TESTIMONIAL_SLOT_INDICES,
} from "@/config/home-testimonials";
import { SUPPORTED_LOCALES } from "@/config/locales";
import type { Database } from "@/db/client";
import { homeTestimonials } from "@/db/schema";
import {
  formatAuthorFullName,
  formatAuthorInitials,
} from "@/features/testimonials/domain/format-author-initials";

export type HomeTestimonialRecord = {
  id: string;
  locale: string;
  slotIndex: number;
  firstName: string;
  lastName: string;
  quote: string;
  rating: number;
  sortOrder: number;
  isActive: boolean;
};

export type HomeTestimonialPublicDto = {
  quote: string;
  authorInitials: string;
  authorName: string;
  rating: number;
};

export type UpsertHomeTestimonialInput = {
  id?: string;
  locale: string;
  slotIndex: number;
  firstName: string;
  lastName: string;
  quote: string;
  rating: number;
  isActive: boolean;
};

function isDisplayable(record: HomeTestimonialRecord): boolean {
  return (
    record.isActive &&
    record.quote.trim().length > 0 &&
    record.firstName.trim().length > 0
  );
}

function toPublicDto(record: HomeTestimonialRecord): HomeTestimonialPublicDto {
  return {
    quote: record.quote.trim(),
    authorInitials: formatAuthorInitials(record.firstName, record.lastName),
    authorName: formatAuthorFullName(record.firstName, record.lastName),
    rating: record.rating,
  };
}

export class HomeTestimonialRepository {
  constructor(private readonly database: Database) {}

  async listAll(): Promise<HomeTestimonialRecord[]> {
    return this.database
      .select({
        id: homeTestimonials.id,
        locale: homeTestimonials.locale,
        slotIndex: homeTestimonials.slotIndex,
        firstName: homeTestimonials.firstName,
        lastName: homeTestimonials.lastName,
        quote: homeTestimonials.quote,
        rating: homeTestimonials.rating,
        sortOrder: homeTestimonials.sortOrder,
        isActive: homeTestimonials.isActive,
      })
      .from(homeTestimonials)
      .orderBy(asc(homeTestimonials.locale), asc(homeTestimonials.slotIndex));
  }

  async listAllForAdmin(): Promise<HomeTestimonialRecord[]> {
    const rows = await this.listAll();
    const byLocaleSlot = new Map(
      rows.map((row) => [`${row.locale}:${row.slotIndex}`, row]),
    );

    const result: HomeTestimonialRecord[] = [];

    for (const locale of SUPPORTED_LOCALES) {
      for (const slotIndex of HOME_TESTIMONIAL_SLOT_INDICES) {
        const existing = byLocaleSlot.get(`${locale.code}:${slotIndex}`);

        if (existing) {
          result.push(existing);
          continue;
        }

        result.push({
          id: "",
          locale: locale.code,
          slotIndex,
          firstName: "",
          lastName: "",
          quote: "",
          rating: 5,
          sortOrder: slotIndex,
          isActive: false,
        });
      }
    }

    return result;
  }

  async listActiveForLocale(locale: string): Promise<HomeTestimonialPublicDto[]> {
    const rows = await this.database
      .select({
        id: homeTestimonials.id,
        locale: homeTestimonials.locale,
        slotIndex: homeTestimonials.slotIndex,
        firstName: homeTestimonials.firstName,
        lastName: homeTestimonials.lastName,
        quote: homeTestimonials.quote,
        rating: homeTestimonials.rating,
        sortOrder: homeTestimonials.sortOrder,
        isActive: homeTestimonials.isActive,
      })
      .from(homeTestimonials)
      .where(
        and(
          eq(homeTestimonials.locale, locale),
          eq(homeTestimonials.isActive, true),
        ),
      )
      .orderBy(asc(homeTestimonials.slotIndex));

    return rows.filter(isDisplayable).map(toPublicDto);
  }

  async upsertAll(
    testimonials: UpsertHomeTestimonialInput[],
  ): Promise<HomeTestimonialRecord[]> {
    await this.database.transaction(async (tx) => {
      for (const testimonial of testimonials) {
        const firstName = testimonial.firstName.trim();
        const lastName = testimonial.lastName.trim();
        const quote = testimonial.quote.trim();
        const isActive =
          testimonial.isActive &&
          quote.length > 0 &&
          firstName.length > 0;

        const [existing] = await tx
          .select({ id: homeTestimonials.id })
          .from(homeTestimonials)
          .where(
            and(
              eq(homeTestimonials.locale, testimonial.locale),
              eq(homeTestimonials.slotIndex, testimonial.slotIndex),
            ),
          )
          .limit(1);

        if (existing) {
          await tx
            .update(homeTestimonials)
            .set({
              firstName,
              lastName,
              quote,
              rating: testimonial.rating,
              sortOrder: testimonial.slotIndex,
              isActive,
              deletedAt: null,
            })
            .where(eq(homeTestimonials.id, existing.id));
          continue;
        }

        if (!isActive && !quote && !firstName && !lastName) {
          continue;
        }

        await tx.insert(homeTestimonials).values({
          locale: testimonial.locale,
          slotIndex: testimonial.slotIndex,
          firstName,
          lastName,
          quote,
          rating: testimonial.rating,
          sortOrder: testimonial.slotIndex,
          isActive,
        });
      }
    });

    return this.listAllForAdmin();
  }
}
