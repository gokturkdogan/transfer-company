export const HOME_TESTIMONIAL_SLOT_COUNT = 3;

export const HOME_TESTIMONIAL_SLOT_INDICES = [0, 1, 2] as const;

export type HomeTestimonialSlotIndex =
  (typeof HOME_TESTIMONIAL_SLOT_INDICES)[number];
