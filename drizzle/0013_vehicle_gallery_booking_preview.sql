ALTER TABLE "vehicle_categories"
  ADD COLUMN IF NOT EXISTS "cover_in_booking_preview" boolean DEFAULT false NOT NULL;

ALTER TABLE "vehicle_category_images"
  ADD COLUMN IF NOT EXISTS "is_booking_preview" boolean DEFAULT false NOT NULL;
