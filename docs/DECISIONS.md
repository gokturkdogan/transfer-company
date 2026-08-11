# Architecture Decision Records

## ADR-001: Feature-colocated services and repositories

**Date:** 2026-08-08
**Status:** Accepted

**Context:** The initial structure listed `server/services/` and `server/repositories/` alongside `features/`, which would split every domain across two directory trees.

**Decision:** Domain services and repositories live inside their feature module:
- `src/features/<domain>/server/service.ts`
- `src/features/<domain>/server/repository.ts`

`src/server/` holds only cross-cutting infrastructure (errors, logger, action wrapper).

**Consequences:** Each feature is self-contained. Import paths are longer but boundaries are clearer.

---

## ADR-002: Neon WebSocket driver for database

**Date:** 2026-08-08
**Status:** Accepted

**Context:** Neon offers HTTP (`neon-http`) and WebSocket (`neon-serverless`) drivers. HTTP is faster for single queries but cannot do interactive transactions.

**Decision:** Use `drizzle-orm/neon-serverless` with a module-scope `Pool`. Reservation creation requires atomic multi-table writes.

**Consequences:** Slightly higher latency per query than HTTP, but transaction support is essential. Node 24 provides global `WebSocket`, so no `ws` dependency needed.

---

## ADR-003: Integer minor units for money

**Date:** 2026-08-08
**Status:** Accepted

**Context:** JavaScript floating-point arithmetic is unsafe for money calculations.

**Decision:** Store all prices as `integer` minor units (e.g. `4500` = €45.00) with a `char(3)` currency column. All arithmetic via `src/lib/money.ts`.

**Consequences:** No float drift. Display formatting uses `Intl.NumberFormat`. Conversion helpers: `majorToMinor()`, `minorToMajor()`.

---

## ADR-004: Route matrix pricing

**Date:** 2026-08-08
**Status:** Accepted

**Context:** Transfer pricing could be distance-based, zone-based, or route-matrix-based.

**Decision:** Use a route matrix: one price per (route, vehicle category, trip type) in `route_prices`. Round-trip is a separate matrix entry, not 2× one-way.

**Consequences:** Simple to administer. Adding new routes requires explicit price rows. Distance-based pricing can be reconsidered later if needed.

---

## ADR-005: Sibling translation tables for DB content

**Date:** 2026-08-08
**Status:** Accepted

**Context:** Multilingual admin content could use JSONB columns or normalized translation tables.

**Decision:** Sibling translation tables with `(entity_id, locale)` unique constraints. Relational, indexable, easy to add locales.

**Consequences:** More tables and joins, but stronger constraints and per-locale querying. Pattern: `location_translations`, `vehicle_category_translations`, etc.

---

## ADR-006: Turkish as default locale

**Date:** 2026-08-08
**Status:** Accepted

**Context:** Platform serves Turkish market primarily with international tourists.

**Decision:** Default locale is `tr`. URL prefix always present (`localePrefix: "always"`).

**Consequences:** Root `/` redirects to `/tr/`. Fallback locale for missing translations is `tr`.

---

## ADR-007: Column-based route pricing (supersedes ADR-004)

**Date:** 2026-08-08
**Status:** Accepted (supersedes ADR-004)

**Context:** ADR-004 used one row per trip type. Phase 2 requires explicit `oneWayPrice` and `roundTripPrice` on the same record with shared currency.

**Decision:** `route_prices` has one row per (route, vehicle category) with `one_way_price_minor`, nullable `round_trip_price_minor`, and `currency`.

**Consequences:** Nullable round-trip means "not offered". Currency consistency enforced per row. Simpler admin UX.

---

## ADR-008: Reservation items for multi-vehicle (supersedes Phase 1 reservation shape)

**Date:** 2026-08-08
**Status:** Accepted

**Context:** Phase 1 stored single `vehicle_category_id` and `reservation_extras` on the reservation.

**Decision:** Replace with `reservation_items` table supporting `TRANSFER_VEHICLE` and `EXTRA_SERVICE` line items with quantity and snapshot pricing. Remove `vehicle_category_id` and `reservation_extras` from reservations.

**Consequences:** Multi-vehicle bookings supported. Historical integrity per line item. Reservation header stores aggregate totals only.

---

## ADR-009: Luggage vehicle as configurable extra

**Date:** 2026-08-08
**Status:** Accepted

**Context:** Luggage overflow could be hardcoded as special logic.

**Decision:** Any extra with `luggage_capacity_per_unit` can act as a luggage vehicle. Capacity engine uses `ceil(overflow / capacity)`. No hardcoded prices, codes, or quantities.

**Consequences:** Admin-configurable. Multiple luggage vehicle types possible in future.

---

## ADR-010: Pure domain layer convention

**Date:** 2026-08-08
**Status:** Accepted

**Context:** Pricing and capacity logic must be unit-testable without database or React.

**Decision:** Pure business logic lives in `features/<domain>/domain/`. These modules must not import `db`, `server-only`, React, or `src/server/`.

**Consequences:** Table-driven unit tests. Server services orchestrate; domain functions calculate.

---

## ADR-011: Dedicated capacity feature module

**Date:** 2026-08-08
**Status:** Accepted

**Context:** Capacity rules could be embedded in pricing service.

**Decision:** Capacity assessment lives in `src/features/capacity/domain/`. Pricing calls capacity but does not contain capacity rules.

**Consequences:** Clear separation. Capacity can be reused by admin and recommendation UIs.

---

## ADR-012: Route Handlers for public booking API

**Date:** 2026-08-08
**Status:** Accepted

**Context:** Public booking could use Server Actions or Route Handlers. Future mobile clients need a reusable HTTP API.

**Decision:** Expose `POST /api/quote` and `POST /api/reservations` as Route Handlers. No duplicate Server Action implementation.

**Consequences:** Single implementation. Straightforward rate limiting, idempotency headers, and integration testing.

---

## ADR-013: Postgres-backed rate limiting

**Date:** 2026-08-08
**Status:** Accepted

**Context:** Vercel serverless needs shared rate-limit state. External Redis adds dependency.

**Decision:** Fixed-window counters in `rate_limit_buckets` table with `INSERT ... ON CONFLICT DO UPDATE`.

**Consequences:** Works across instances without new dependencies. Small DB write per limited request.

---

## ADR-014: Idempotency key table

**Date:** 2026-08-08
**Status:** Accepted

**Context:** Duplicate reservation submissions on network retries.

**Decision:** Client `Idempotency-Key` header + unique DB constraint on `reservation_idempotency_keys.key` + request hash comparison. Replay returns existing reservation.

**Consequences:** No duplicate reservations on retries. 409 on payload mismatch. 24-hour TTL.

---

## ADR-015: Project timezone (Europe/Istanbul)

**Date:** 2026-08-08
**Status:** Accepted

**Context:** Transfer dates must not depend on server machine timezone.

**Decision:** `PROJECT_TIME_ZONE = "Europe/Istanbul"`. Client sends wall-clock `YYYY-MM-DDTHH:mm`. Server converts via `Intl` offset probing in `src/lib/datetime.ts`. Storage as UTC `timestamptz`.

**Consequences:** Explicit, testable conversion. No string concatenation. DST handled by Intl.

---

## ADR-016: Notification after commit

**Date:** 2026-08-08
**Status:** Accepted

**Context:** Email failures must not roll back reservations.

**Decision:** `NotificationService` invoked after transaction commit. Failures logged to `notification_logs`. Never inside DB transaction.

**Consequences:** Reservation persistence is reliable. Email is best-effort in Phase 3.

---

## ADR-017: Quote selection extension

**Date:** 2026-08-08
**Status:** Accepted

**Context:** Optional extras requote must use the same pricing path as reservation creation.

**Decision:** Extend `POST /api/quote` with optional `selection`; `AvailabilityService` delegates to `QuoteService` when present.

**Consequences:** No second pricing endpoint. Backward compatible.

---

## ADR-018: Scoped booking reducer + context

**Date:** 2026-08-08
**Status:** Accepted

**Context:** Six-step booking flow needs predictable state without global store.

**Decision:** Pure `bookingFlowReducer` with feature-scoped `BookingFlowProvider`. No Redux/Zustand.

**Consequences:** Reducer is unit-testable. State does not leak outside booking feature.

---

## ADR-019: Signature-based quote invalidation

**Date:** 2026-08-08
**Status:** Accepted

**Context:** Stale quotes must not be submittable after search changes.

**Decision:** `buildSearchSignature()` hashes search fields; mismatch clears quote, selection, and optional extras.

**Consequences:** Client cannot submit outdated pricing after editing search mid-flow.

---

## ADR-020: Vitest jsdom project

**Date:** 2026-08-08
**Status:** Accepted

**Context:** Booking UI needs React component tests alongside existing node tests.

**Decision:** Split Vitest into `node` (`*.test.ts`) and `jsdom` (`*.test.tsx`) projects.

**Consequences:** Component RTL smoke tests without slowing domain unit tests.

---

## ADR-021: Self-referential location hierarchy

**Date:** 2026-08-08
**Status:** Accepted

**Context:** Flat location pickers cannot model city → district → hotel relationships or enforce pricing boundaries.

**Decision:** Add `locations.parent_id` self-reference. New types `CITY` and `DISTRICT`. Migrate legacy `REGION` locations to `DISTRICT` under generated cities.

**Consequences:** Hierarchy validation in pure domain (`assertValidParent`). `regions` table retained for FK compatibility but is not the hierarchy mechanism.

---

## ADR-022: Airport-to-district pricing invariant

**Date:** 2026-08-08
**Status:** Accepted

**Context:** Hotel-specific routes would explode the price matrix and allow price manipulation via hotel selection.

**Decision:** Quote price is always **Airport → District**. API fields renamed to `originAirportId` / `destinationDistrictId`. Hotels never appear in `routes` or pricing editor.

**Consequences:** Simpler admin pricing. Hotel choice is drop-off detail only.

---

## ADR-023: Hotel as drop-off detail

**Date:** 2026-08-08
**Status:** Accepted

**Context:** Customers need a specific hotel or custom address within a priced district.

**Decision:** Reservations store optional `hotelLocationId` or `customDestination` plus `snapshotDropoffLabel`. Hotel excluded from quote search signature.

**Consequences:** Changing hotel does not invalidate quote. District change clears hotel in UI reducer.

---

## ADR-024: Custom admin session auth

**Date:** 2026-08-08
**Status:** Accepted

**Context:** Admin panel needs authentication without adding dependencies.

**Decision:** scrypt password hashes in `admin_users`, session tokens in `admin_sessions`, HttpOnly signed cookie, `requireAdminSession()` guard.

**Consequences:** Minimal auth surface. `pnpm admin:create` bootstraps first user. Panel is English-only at `/admin/*`.

---

## ADR-025: Marketing ISR + public catalog cache

**Date:** 2026-08-11
**Status:** Accepted

**Context:** Marketing pages were `force-dynamic` solely because airports, cities, districts, fleet, and locales load from Postgres. That prevented CDN caching while catalog data changes infrequently.

**Decision:** Marketing routes use `revalidate = 120`. Shared catalog reads go through `unstable_cache` wrappers in `src/server/cache/public-catalog.ts` (services/repos instantiated inside the cached callback). Booking remains `force-dynamic` for `searchParams` but reuses the same cached loaders.

**Consequences:** Faster TTFB on public pages with up to ~2 minutes catalog staleness. Districts load in one query (`getAllDistricts`) instead of per-city N+1. On-demand revalidation tags can be added later if admin edits need immediate visibility.

---

## ADR-026: Slim home search context + page data facades

**Date:** 2026-08-11
**Status:** Accepted

**Context:** The homepage hero wrapped `BookingFlowProvider`, pulling quote/reservation client code into the first viewport. Admin Server Actions lived in one large file. Route pages duplicated catalog Promise wiring.

**Decision:** Homepage uses `HomeSearchProvider` (search-only). Shared `useSearchFormState()` adapts home vs booking. BookingFlow steps and heavy search widgets use `next/dynamic`. Page routes call `getHomePageData` / `getBookingPageData`. Admin mutations are split under `features/admin/server/actions/`.

**Consequences:** Smaller hero JS, clearer page composition, and easier admin action maintenance. Full message namespace loading remains until a safer next-intl split is validated.
