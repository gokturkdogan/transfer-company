# Booking Engine

## Overview

The booking engine orchestrates the creation of transfer reservation requests. A reservation is a **request**, not a confirmed paid booking.

## Flow

```
1. User selects trip type (one-way / round-trip)
2. User selects airport, city (auto-resolved when single city), and district
3. POST /api/quote resolves airport→district route and returns eligible vehicle options
4. User selects vehicle(s) based on capacity and eligibility
5. User selects optional extras locally (summary prices with `includedQuantity`; no quote round-trip). Required child seats / luggage vehicles come from the initial quote (or a luggage-overflow requote).
6. User selects hotel or custom drop-off (Step 4 — does not affect price)
7. POST /api/reservations recalculates quote server-side and creates reservation
8. Notifications attempted after commit (failures logged, never block persistence)
```

### Quote refresh rules (details step)

| Change | Network |
|--------|---------|
| Optional extras quantity | **None** — `SET_EXTRAS` + client `buildOrderPricing` (`PER_UNIT` uses `max(0, qty − includedQuantity)`) |
| Luggage ≤ vehicle capacity | **None** — search state only |
| Luggage crosses above capacity, changes while over, or returns under | **POST /api/quote** — server applies/updates luggage-vehicle required extras |
| Infant / passenger / other search draft edits | **None until Search** — quote stays; `requestQuote` on submit refreshes |
## Public API

| Endpoint | Service | Purpose |
|----------|---------|---------|
| `POST /api/quote` | `AvailabilityService` | Airport→district vehicle options with pricing |
| `POST /api/reservations` | `BookingService` | Authoritative reservation creation |
| `GET /api/locations/hotels` | `LocationService` | Active hotels for a district (Step 4) |

## Public UI (Phase 4)

| Route | Type | Responsibility |
|-------|------|----------------|
| `/[locale]` | Server Component | Hero + search launcher |
| `/[locale]/booking` | Server Component | Loads airports, cities, districts; renders `BookingFlow` |

State: pure `bookingFlowReducer` + `BookingFlowProvider`. Draft search edits do not clear the quote; pressing Search refreshes results.

See [BOOKING_UI.md](./BOOKING_UI.md).

See [API_CONTRACTS.md](./API_CONTRACTS.md) for request/response shapes.

## Status model

| Status | Meaning |
|--------|---------|
| `PENDING` | Initial state — request submitted, awaiting admin review |
| `CONFIRMED` | Admin confirmed the transfer |
| `CANCELLED` | Request cancelled |
| `COMPLETED` | Transfer completed |

## Validation rules

- Passenger count must be positive
- `passengers[]` is required and must match `passengerCount + infantCount`
- Luggage counts must be non-negative
- `outboundAt` must be at least `MIN_BOOKING_LEAD_MINUTES` in the future
- Round-trip requires `returnAt` after `outboundAt`
- Route must exist, be active, and match `originAirportId` / `destinationDistrictId`
- Origin must be `AIRPORT`, destination must be `DISTRICT`
- If `hotelLocationId` is provided: hotel must be active and `parentId` must equal `destinationDistrictId`
- `hotelLocationId` and `customDestination` are mutually exclusive
- Vehicle configuration must be `ELIGIBLE` or `ELIGIBLE_WITH_EXTRAS`
- Non-customer-selectable extras cannot be manually requested (auto-injected extras bypass this)
- Prices are always calculated server-side — **never trust client-supplied prices**
- Zod input schemas contain **no authoritative price fields** (`clientQuotedTotalMinor` is logged-only)

## Snapshots

On reservation creation, the system:

1. Recalculates quote via `QuoteService.calculateTransferQuote()`
2. Maps quote lines to `reservation_items` via `buildReservationItems()`
3. Stores reservation-level `snapshotRouteLabel` (airport → district), `snapshotDropoffLabel`, `subtotalMinor`, `totalMinor`, `currency`
4. Stores `passenger_details` from the request `passengers` array; `notes` stays customer free-text only

Each `reservation_item` preserves:

- `itemType` (`TRANSFER_VEHICLE` | `EXTRA_SERVICE`)
- `snapshotName`
- `quantity`, `unitPriceMinor`, `totalPriceMinor`, `currency`

## Reference numbers

Generated via `src/lib/reference.ts` — format `TR-XXXXXX` using `crypto.getRandomValues` and an unambiguous alphabet. Separate from internal UUID. Collision retry up to 3 attempts.

## Idempotency

- Client sends `Idempotency-Key` header
- Server claims key in `reservation_idempotency_keys` before creating reservation
- Duplicate key + same payload → replay existing reservation
- Duplicate key + different payload → HTTP 409
- TTL: 24 hours

## Anti-spam

- Postgres-backed rate limiting (see SECURITY.md)
- Honeypot field (`website` must be empty)
- Minimum form fill time (3 seconds via `formStartedAt`)
- Turnstile extension point documented but not implemented

## Notifications

`NotificationService` abstraction in `src/server/notifications/`. Invoked **after** transaction commit. Failures logged to `notification_logs` and never rethrown.

When `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, and `SMTP_PASSWORD` are set (see `.env.example`), `SmtpNotificationService` sends:

- **Customer email** — branded HTML confirmation with route, schedule, line items, and total (locale-aware).
- **Admin email** — same reservation summary plus customer contact details and a link to `/admin/reservations/[id]`.
- **Status update email** — sent to the customer when an admin changes reservation status via `/admin/reservations/[id]`. Same dark branded template; includes previous and new status plus trip summary. Logged as `EMAIL_STATUS_CUSTOMER`.

Admin recipient resolution: `ADMIN_NOTIFICATION_EMAIL` → first active `contact_channels` email → `siteConfig.email` fallback.

If SMTP is not configured, notifications are logged as `SKIPPED` via `LoggingNotificationService`.

## Module location

- Availability: `src/features/pricing/server/availability-service.ts`
- Booking: `src/features/booking/server/service.ts`
- Repository: `src/features/booking/server/repository.ts`
- Domain mapper: `src/features/booking/domain/build-reservation-items.ts`
- Schemas: `src/features/booking/schemas/reservation.ts`
- Routes: `src/app/api/quote/route.ts`, `src/app/api/reservations/route.ts`

## Transactions

Reservation creation is atomic via `db.transaction()`:

1. Claim idempotency key (outside transaction, `ON CONFLICT DO NOTHING`)
2. Insert customer
3. Insert reservation with snapshots
4. Insert reservation items
5. Link idempotency key to reservation

On failure, unlinked idempotency key is deleted.

## Domain invariants

- Client price is never trusted
- Deactivated domain records do not rewrite reservation history
- Passenger overflow cannot be solved by luggage vehicle
- Luggage overflow may be solved only by configured luggage extras
- Required luggage vehicles cannot be removed by client (server uses `Math.max` merge)

## Timezone

- Business timezone: `Europe/Istanbul`
- Input: wall-clock `YYYY-MM-DDTHH:mm`
- Storage: UTC `timestamptz`
- Output: wall-clock in `Europe/Istanbul`
- Conversion: `src/lib/datetime.ts`
