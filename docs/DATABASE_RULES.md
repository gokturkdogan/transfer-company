# Database Rules

## Stack

- **Neon PostgreSQL** (serverless, pooled connection string)
- **Drizzle ORM** with SQL migrations via drizzle-kit
- Client: `src/db/client.ts` using `drizzle-orm/neon-serverless`

## Connection management

- Single `Pool` instance created at module scope
- Reused across requests in development via `globalThis` cache
- Use the Neon **pooled** connection string (`-pooler` hostname)
- Never create a new connection per request

## Migrations

**Never use `drizzle-kit push` in production.**

Workflow:

```bash
# 1. Modify schema in src/db/schema/
pnpm db:generate    # generates SQL in drizzle/
pnpm db:migrate     # applies migrations to database
```

For local development, copy `.env.example` to `.env.local` and set `DATABASE_URL`.

Phase 2 rebaselined to `drizzle/0000_*.sql`. Phase 5 adds `0002` (enum values) and `0003` (hierarchy DDL + admin tables). Run backfill SQL manually if migrating existing `REGION` data.

## Schema conventions

- Primary keys: `uuid` with `defaultRandom()`
- Timestamps: `created_at`, `updated_at` (timezone-aware)
- Soft delete: `is_active` (boolean, default true), `deleted_at` (nullable timestamp)
- Money: integer minor units + `currency` char(3)
- Sort order: `sort_order` integer default 0
- Enums: defined once in `src/db/schema/enums.ts` as `as const` tuples feeding `pgEnum`
- Check constraints for domain invariants (lat/lng bounds, trip-type dates, item type refs)

## Translation tables

Pattern: `<entity>_translations` with `(entity_id, locale)` unique constraint.

Parent entities also carry `default_name` as admin fallback when translation is missing.

## Key tables (Phase 5)

| Table | Purpose |
|-------|---------|
| `locations` | Self-referential hierarchy (`parent_id`) |
| `vehicle_categories` | Capacity, brand/model, cover image |
| `vehicle_category_features` | Ordered feature rows per vehicle |
| `vehicle_category_feature_translations` | Localized feature labels |
| `vehicle_category_images` | Up to 4 optional gallery images per vehicle |
| `routes` | Directed airport → district |
| `route_prices` | One row per route + vehicle + currency with one-way/round-trip columns |
| `enabled_currencies` | Admin-selected currencies shown in pricing matrix |
| `extra_services` | Configurable extras incl. luggage vehicle |
| `extra_service_prices` | Per-currency extra prices (admin-managed) |
| `contact_channels` | Site contact emails, phones, WhatsApp numbers |
| `enabled_locales` | Admin-enabled site languages for locale switcher |
| `reservations` | Booking header; district pricing + hotel/custom drop-off |
| `reservation_items` | Snapshot line items (vehicles + extras) |
| `admin_users` | Admin credentials (scrypt hash) |
| `admin_sessions` | Hashed session tokens |

### Reservation drop-off columns

| Column | Purpose |
|--------|---------|
| `pickup_location_id` | Origin airport (legacy column name) |
| `dropoff_location_id` | Pricing district (legacy column name) |
| `hotel_location_id` | Optional hotel drop-off |
| `custom_destination_name` | Optional custom property name |
| `custom_destination_address` | Optional custom address |
| `snapshot_dropoff_label` | Immutable drop-off label at booking time |

## Indexes (with rationale)

| Index | Rationale |
|-------|-----------|
| `routes_origin_destination_unique` | Prevent duplicate route definitions |
| `route_prices_route_vehicle_currency_unique` | One price row per route + vehicle + currency |
| `route_prices_route_active_idx` | Quote lookups filter by route + active |
| `reservations_status_outbound_idx` | Admin list/filter by status + date |
| `reservations_reference_unique` | Public reference lookup |
| `reservation_items_reservation_id_idx` | Load items for a reservation |
| `locations_type_active_idx` | Public location picker queries |
| `locations_parent_id_idx` | Hierarchy child lookups |
| `locations_parent_type_active_idx` | Scoped district/hotel queries |
| `reservations_hotel_location_id_idx` | Hotel FK lookups |
| `extra_services_active_sort_idx` | Ordered extras list |
| `extra_service_prices_extra_currency_unique` | One price row per extra + currency |
| `contact_channels_type_active_sort_idx` | Public contact list by type + active + order |
| `enabled_locales_active_sort_idx` | Active locale list for switcher ordering |
| `vehicle_categories_active_sort_idx` | Ordered vehicle list |
| `vehicle_category_images_category_sort_unique` | Gallery slot per vehicle |
| Translation `(entity_id, locale)` uniques | Per-locale content integrity |

## Query rules

- Select only required columns
- Avoid N+1 queries; use joins or `with` relations
- Use transactions for multi-table writes (reservation + items)
- Repositories live in `features/*/server/repository.ts`

## Soft delete queries

Active records: `WHERE is_active = true AND deleted_at IS NULL`

Never hard-delete rows referenced by reservations.
