# Booking UI

## Overview

The public booking experience is a progressive multi-step flow at `/[locale]/booking`, with a search launcher on the home page. All pricing, eligibility, and capacity decisions come from the server — the UI never duplicates domain logic.

## Steps

| Step | Component | Purpose |
|------|-----------|---------|
| 1 Search | `TransferSearchForm` | Airport, city, district, trip type, dates/times, passengers, luggage |
| 2 Vehicle | `VehicleRecommendationList` | Server-provided options with eligibility states |
| 3 Extras | `RequiredExtrasPanel`, `OptionalExtrasSelector` | Locked required extras + debounced requote for optional |
| 4 Customer | `HotelSelector`, `CustomDestinationFields`, `CustomerDetailsForm`, `FlightDetailsForm` | Drop-off detail, contact and flight info |
| 5 Review | `BookingReview` | Summary and reservation request submission |
| 6 Success | `SuccessStep` | Reference and awaiting-confirmation messaging |

## State ownership

- **Reducer:** `booking-flow-reducer.ts` — pure state machine for step, search, quote, selection, extras, customer, idempotency
- **Context:** `booking-flow-context.tsx` — scoped provider for the booking page (API calls, quote race guard via request sequence id)
- **Home search:** `home-search-context.tsx` — lightweight search-only provider for the homepage hero (no quote/reservation imports)
- **Shared form adapter:** `useSearchFormState()` — HeroSearchBar / launcher read search + dispatch from home or booking context
- **Forms:** controlled via reducer dispatch (RHF-ready structure; counters and selectors use reducer)

## Blocking loader (public only)

Full-screen overlay while waiting on booking network calls. Mounted via `PublicGlobalLoaderProvider` in `src/app/[locale]/layout.tsx` (admin is intentionally out of scope).

| Trigger | Mechanism |
|---------|-----------|
| Quote request / requote | `useGlobalLoaderSync(isLoadingQuote \|\| isSubmitting)` in `BookingFlowProvider` |
| Reservation submit | same sync |
| Hotel list fetch | `useGlobalLoaderSync` in `HotelSelector` |

APIs:

- `useGlobalLoader()` — `show` / `hide` / `withLoader`
- `useGlobalLoaderSync(active, message?)` — bind an external busy flag
- UI: `GlobalLoaderOverlay` with animated brand emblem (`BrandLoaderEmblem` — shine sweep + glow; asset `public/images/brand/loader-emblem.jpg`)

Default copy: `common.loading` in `messages/*.json`.

## Server data sources

| Data | Source |
|------|--------|
| Airports, cities, districts | `LocationService` in Server Component, passed as props |
| Hotels | `GET /api/locations/hotels?districtId=` (client fetch after district selection) |
| Vehicle options | `POST /api/quote` |
| Priced selection (extras) | `POST /api/quote` with `selection` field |
| Reservation | `POST /api/reservations` with `Idempotency-Key` header |

## Quote invalidation

`buildSearchSignature()` hashes: `originAirportId`, `destinationDistrictId`, trip type, outbound/return date-time, passenger and luggage counts.

Hotel and custom destination are **excluded** from the signature — changing drop-off does not invalidate the quote.

**Draft search edits** (airport, district, dates, passengers, trip type, etc.) update `search` only. They **do not** clear the current quote, vehicle selection, extras, or step. Results stay on screen until the user presses search again (`requestQuote` → `QUOTE_SUCCESS`), which replaces the quote and updates `searchSignature`.

Luggage overflow on the details step still requotes explicitly when capacity is crossed (see booking engine quote refresh rules).

## Idempotency

- Key generated via `crypto.randomUUID()` when review submission starts
- Reused across retries for the same booking attempt
- Regenerated when search signature changes or after success

## Required vs optional extras

- **Required:** from `option.requiredExtras` or `selection.requiredExtras` — rendered locked, no quantity control
- **Optional:** from `option.optionalExtras` — editable; changes trigger debounced `POST /api/quote` with `selection`

## Error states

Mapped via `mapApiErrorToKey()` to translation keys under `booking.errors.*`. No raw server messages or stack traces shown.

## RTL

- Logical CSS properties (`ms-`, `me-`, `ps-`, `pe-`, `text-start`)
- `dir` on `<html>` from locale layout
- Automated test scans booking components for forbidden physical-direction classes

## Frontend forbidden calculations

The UI must **never** calculate:

- Luggage overflow or required luggage vehicles
- Vehicle suitability / eligibility
- One-way vs round-trip pricing
- Extra totals or reservation total
- Extra service eligibility

Only `formatMoney()` for display formatting is permitted.

## Location selectors

- `LocationCombobox` — reusable searchable combobox (Command + Popover)
- Search step: airport → city (hidden when only one active city) → district
- Step 4: `HotelSelector` loads hotels for selected district; "Hotel not listed" reveals `CustomDestinationFields`
- `SET_DISTRICT` always clears hotel and custom destination state
- Review and success steps show pricing destination (district) and actual drop-off separately

## Known limitations

- Vehicle `shortDescription` not yet exposed in availability DTO
- Success step is in-memory only (no public reservation lookup endpoint)

## Pages

- `/[locale]` — hero + slim `HomeSearchProvider` / `HeroSearchBar` → navigates to booking with query params
- `/[locale]/booking` — full `BookingFlow` (`force-dynamic`; catalog via cached loaders / `getBookingPageData`)
- `/[locale]/transfers/[districtSlug]` — SEO destination landing with booking CTA

## Seed data

Run `pnpm db:seed` after migration to populate Antalya-region sample data for end-to-end testing.
