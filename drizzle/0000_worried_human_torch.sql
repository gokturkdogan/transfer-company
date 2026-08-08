CREATE TYPE "public"."extra_pricing_mode" AS ENUM('FIXED', 'PER_UNIT');--> statement-breakpoint
CREATE TYPE "public"."location_type" AS ENUM('AIRPORT', 'REGION', 'HOTEL', 'TRANSFER_POINT', 'MARINA', 'CUSTOM_LOCATION');--> statement-breakpoint
CREATE TYPE "public"."reservation_item_type" AS ENUM('TRANSFER_VEHICLE', 'EXTRA_SERVICE');--> statement-breakpoint
CREATE TYPE "public"."reservation_status" AS ENUM('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED');--> statement-breakpoint
CREATE TYPE "public"."trip_type" AS ENUM('ONE_WAY', 'ROUND_TRIP');--> statement-breakpoint
CREATE TABLE "location_translations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"location_id" uuid NOT NULL,
	"locale" varchar(5) NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"description" varchar(1000),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "locations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"region_id" uuid,
	"type" "location_type" NOT NULL,
	"code" varchar(64) NOT NULL,
	"default_name" varchar(255) NOT NULL,
	"address" text,
	"latitude" double precision,
	"longitude" double precision,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "locations_latitude_bounds" CHECK ("locations"."latitude" IS NULL OR ("locations"."latitude" >= -90 AND "locations"."latitude" <= 90)),
	CONSTRAINT "locations_longitude_bounds" CHECK ("locations"."longitude" IS NULL OR ("locations"."longitude" >= -180 AND "locations"."longitude" <= 180))
);
--> statement-breakpoint
CREATE TABLE "region_translations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"region_id" uuid NOT NULL,
	"locale" varchar(5) NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" varchar(1000),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "regions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(32) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "vehicle_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(32) NOT NULL,
	"default_name" varchar(255) NOT NULL,
	"passenger_capacity" integer NOT NULL,
	"large_luggage_capacity" integer NOT NULL,
	"cabin_luggage_capacity" integer NOT NULL,
	"image_key" varchar(255),
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "vehicle_category_translations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vehicle_category_id" uuid NOT NULL,
	"locale" varchar(5) NOT NULL,
	"name" varchar(255) NOT NULL,
	"short_description" varchar(500),
	"description" varchar(1000),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "route_prices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"route_id" uuid NOT NULL,
	"vehicle_category_id" uuid NOT NULL,
	"one_way_price_minor" integer NOT NULL,
	"round_trip_price_minor" integer,
	"currency" char(3) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "route_prices_one_way_non_negative" CHECK ("route_prices"."one_way_price_minor" >= 0),
	CONSTRAINT "route_prices_round_trip_non_negative" CHECK ("route_prices"."round_trip_price_minor" IS NULL OR "route_prices"."round_trip_price_minor" >= 0)
);
--> statement-breakpoint
CREATE TABLE "routes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"origin_location_id" uuid NOT NULL,
	"destination_location_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "routes_origin_not_destination" CHECK ("routes"."origin_location_id" <> "routes"."destination_location_id")
);
--> statement-breakpoint
CREATE TABLE "extra_service_translations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"extra_service_id" uuid NOT NULL,
	"locale" varchar(5) NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" varchar(1000),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "extra_services" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(32) NOT NULL,
	"pricing_mode" "extra_pricing_mode" NOT NULL,
	"price_minor" integer NOT NULL,
	"currency" char(3) NOT NULL,
	"customer_selectable" boolean DEFAULT true NOT NULL,
	"auto_suggested" boolean DEFAULT false NOT NULL,
	"min_quantity" integer DEFAULT 1 NOT NULL,
	"max_quantity" integer,
	"luggage_capacity_per_unit" integer,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "extra_services_price_non_negative" CHECK ("extra_services"."price_minor" >= 0),
	CONSTRAINT "extra_services_quantity_bounds" CHECK ("extra_services"."max_quantity" IS NULL OR "extra_services"."max_quantity" >= "extra_services"."min_quantity"),
	CONSTRAINT "extra_services_luggage_capacity_positive" CHECK ("extra_services"."luggage_capacity_per_unit" IS NULL OR "extra_services"."luggage_capacity_per_unit" > 0)
);
--> statement-breakpoint
CREATE TABLE "customers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone" varchar(32) NOT NULL,
	"whatsapp_phone" varchar(32),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reservation_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reservation_id" uuid NOT NULL,
	"item_type" "reservation_item_type" NOT NULL,
	"vehicle_category_id" uuid,
	"extra_service_id" uuid,
	"snapshot_name" varchar(255) NOT NULL,
	"quantity" integer NOT NULL,
	"unit_price_minor" integer NOT NULL,
	"total_price_minor" integer NOT NULL,
	"currency" char(3) NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "reservation_items_quantity_positive" CHECK ("reservation_items"."quantity" > 0),
	CONSTRAINT "reservation_items_total_equals_unit_times_quantity" CHECK ("reservation_items"."total_price_minor" = "reservation_items"."unit_price_minor" * "reservation_items"."quantity"),
	CONSTRAINT "reservation_items_transfer_vehicle_ref" CHECK (("reservation_items"."item_type" = 'TRANSFER_VEHICLE' AND "reservation_items"."vehicle_category_id" IS NOT NULL AND "reservation_items"."extra_service_id" IS NULL) OR ("reservation_items"."item_type" = 'EXTRA_SERVICE' AND "reservation_items"."extra_service_id" IS NOT NULL AND "reservation_items"."vehicle_category_id" IS NULL))
);
--> statement-breakpoint
CREATE TABLE "reservations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reference" varchar(32) NOT NULL,
	"status" "reservation_status" DEFAULT 'PENDING' NOT NULL,
	"trip_type" "trip_type" NOT NULL,
	"customer_id" uuid NOT NULL,
	"pickup_location_id" uuid NOT NULL,
	"dropoff_location_id" uuid NOT NULL,
	"route_id" uuid NOT NULL,
	"outbound_at" timestamp with time zone NOT NULL,
	"return_at" timestamp with time zone,
	"outbound_flight_number" varchar(16),
	"return_flight_number" varchar(16),
	"passenger_count" integer NOT NULL,
	"large_luggage_count" integer NOT NULL,
	"cabin_luggage_count" integer DEFAULT 0 NOT NULL,
	"snapshot_route_label" varchar(500) NOT NULL,
	"subtotal_minor" integer NOT NULL,
	"total_minor" integer NOT NULL,
	"currency" char(3) NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "reservations_passenger_count_positive" CHECK ("reservations"."passenger_count" > 0),
	CONSTRAINT "reservations_luggage_non_negative" CHECK ("reservations"."large_luggage_count" >= 0 AND "reservations"."cabin_luggage_count" >= 0),
	CONSTRAINT "reservations_round_trip_return_required" CHECK ("reservations"."trip_type" <> 'ROUND_TRIP' OR "reservations"."return_at" IS NOT NULL),
	CONSTRAINT "reservations_return_after_outbound" CHECK ("reservations"."return_at" IS NULL OR "reservations"."return_at" > "reservations"."outbound_at")
);
--> statement-breakpoint
ALTER TABLE "location_translations" ADD CONSTRAINT "location_translations_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "locations" ADD CONSTRAINT "locations_region_id_regions_id_fk" FOREIGN KEY ("region_id") REFERENCES "public"."regions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "region_translations" ADD CONSTRAINT "region_translations_region_id_regions_id_fk" FOREIGN KEY ("region_id") REFERENCES "public"."regions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicle_category_translations" ADD CONSTRAINT "vehicle_category_translations_vehicle_category_id_vehicle_categories_id_fk" FOREIGN KEY ("vehicle_category_id") REFERENCES "public"."vehicle_categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "route_prices" ADD CONSTRAINT "route_prices_route_id_routes_id_fk" FOREIGN KEY ("route_id") REFERENCES "public"."routes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "route_prices" ADD CONSTRAINT "route_prices_vehicle_category_id_vehicle_categories_id_fk" FOREIGN KEY ("vehicle_category_id") REFERENCES "public"."vehicle_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "routes" ADD CONSTRAINT "routes_origin_location_id_locations_id_fk" FOREIGN KEY ("origin_location_id") REFERENCES "public"."locations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "routes" ADD CONSTRAINT "routes_destination_location_id_locations_id_fk" FOREIGN KEY ("destination_location_id") REFERENCES "public"."locations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "extra_service_translations" ADD CONSTRAINT "extra_service_translations_extra_service_id_extra_services_id_fk" FOREIGN KEY ("extra_service_id") REFERENCES "public"."extra_services"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reservation_items" ADD CONSTRAINT "reservation_items_reservation_id_reservations_id_fk" FOREIGN KEY ("reservation_id") REFERENCES "public"."reservations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reservation_items" ADD CONSTRAINT "reservation_items_vehicle_category_id_vehicle_categories_id_fk" FOREIGN KEY ("vehicle_category_id") REFERENCES "public"."vehicle_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reservation_items" ADD CONSTRAINT "reservation_items_extra_service_id_extra_services_id_fk" FOREIGN KEY ("extra_service_id") REFERENCES "public"."extra_services"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_pickup_location_id_locations_id_fk" FOREIGN KEY ("pickup_location_id") REFERENCES "public"."locations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_dropoff_location_id_locations_id_fk" FOREIGN KEY ("dropoff_location_id") REFERENCES "public"."locations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_route_id_routes_id_fk" FOREIGN KEY ("route_id") REFERENCES "public"."routes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "location_translations_location_locale_unique" ON "location_translations" USING btree ("location_id","locale");--> statement-breakpoint
CREATE UNIQUE INDEX "location_translations_locale_slug_unique" ON "location_translations" USING btree ("locale","slug");--> statement-breakpoint
CREATE INDEX "location_translations_locale_idx" ON "location_translations" USING btree ("locale");--> statement-breakpoint
CREATE UNIQUE INDEX "locations_code_unique" ON "locations" USING btree ("code");--> statement-breakpoint
CREATE INDEX "locations_region_id_idx" ON "locations" USING btree ("region_id");--> statement-breakpoint
CREATE INDEX "locations_type_active_idx" ON "locations" USING btree ("type","is_active");--> statement-breakpoint
CREATE UNIQUE INDEX "region_translations_region_locale_unique" ON "region_translations" USING btree ("region_id","locale");--> statement-breakpoint
CREATE INDEX "region_translations_locale_idx" ON "region_translations" USING btree ("locale");--> statement-breakpoint
CREATE UNIQUE INDEX "regions_code_unique" ON "regions" USING btree ("code");--> statement-breakpoint
CREATE INDEX "regions_is_active_idx" ON "regions" USING btree ("is_active");--> statement-breakpoint
CREATE UNIQUE INDEX "vehicle_categories_code_unique" ON "vehicle_categories" USING btree ("code");--> statement-breakpoint
CREATE INDEX "vehicle_categories_active_sort_idx" ON "vehicle_categories" USING btree ("is_active","sort_order");--> statement-breakpoint
CREATE UNIQUE INDEX "vehicle_category_translations_category_locale_unique" ON "vehicle_category_translations" USING btree ("vehicle_category_id","locale");--> statement-breakpoint
CREATE INDEX "vehicle_category_translations_locale_idx" ON "vehicle_category_translations" USING btree ("locale");--> statement-breakpoint
CREATE UNIQUE INDEX "route_prices_route_vehicle_unique" ON "route_prices" USING btree ("route_id","vehicle_category_id");--> statement-breakpoint
CREATE INDEX "route_prices_route_active_idx" ON "route_prices" USING btree ("route_id","is_active");--> statement-breakpoint
CREATE UNIQUE INDEX "routes_origin_destination_unique" ON "routes" USING btree ("origin_location_id","destination_location_id");--> statement-breakpoint
CREATE INDEX "routes_active_idx" ON "routes" USING btree ("is_active");--> statement-breakpoint
CREATE UNIQUE INDEX "extra_service_translations_service_locale_unique" ON "extra_service_translations" USING btree ("extra_service_id","locale");--> statement-breakpoint
CREATE INDEX "extra_service_translations_locale_idx" ON "extra_service_translations" USING btree ("locale");--> statement-breakpoint
CREATE UNIQUE INDEX "extra_services_code_unique" ON "extra_services" USING btree ("code");--> statement-breakpoint
CREATE INDEX "extra_services_active_sort_idx" ON "extra_services" USING btree ("is_active","sort_order");--> statement-breakpoint
CREATE INDEX "customers_email_idx" ON "customers" USING btree ("email");--> statement-breakpoint
CREATE INDEX "customers_phone_idx" ON "customers" USING btree ("phone");--> statement-breakpoint
CREATE INDEX "reservation_items_reservation_id_idx" ON "reservation_items" USING btree ("reservation_id");--> statement-breakpoint
CREATE UNIQUE INDEX "reservations_reference_unique" ON "reservations" USING btree ("reference");--> statement-breakpoint
CREATE INDEX "reservations_status_outbound_idx" ON "reservations" USING btree ("status","outbound_at");--> statement-breakpoint
CREATE INDEX "reservations_customer_id_idx" ON "reservations" USING btree ("customer_id");