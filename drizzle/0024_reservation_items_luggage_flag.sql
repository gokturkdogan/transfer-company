ALTER TABLE "reservation_items"
  ADD COLUMN IF NOT EXISTS "is_luggage_overflow_vehicle" boolean DEFAULT false NOT NULL;
