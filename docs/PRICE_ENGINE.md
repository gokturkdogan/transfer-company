# Price Engine

## Model

Pricing is a **route matrix**, not distance-based. Each price row in `route_prices` represents:

```
(route_id, vehicle_category_id) → one_way_price_minor, round_trip_price_minor?, currency
```

## Trip type pricing

| Trip Type | Price source |
|-----------|-------------|
| `ONE_WAY` | `one_way_price_minor` |
| `ROUND_TRIP` | `round_trip_price_minor` (must not be null) |

Round-trip price is an explicit matrix value, **not** 2× one-way.

Example: AYT → Belek, VIP Vito: one-way €45.00 (`4500`), round-trip €85.00 (`8500`).

## Extra services

Each extra has `pricingMode`:

| Mode | Calculation |
|------|-------------|
| `FIXED` | Flat price regardless of quantity (quantity stored as 1 on line item) |
| `PER_UNIT` | `unitPriceMinor × max(0, quantity − includedQuantity)` |

Luggage overflow is billed as an additional **fleet vehicle line** at route matrix price (cheapest suitable category), not as a separate extra catalogue item.

`includedQuantity` on `extra_services` defines how many units are free per booking for `PER_UNIT` extras. Required infant child seats use `resolveIncludedQuantityForRequiredChildSeats()` so every auto-added seat for infants is free; optional add-ons still respect catalogue included units.

Persisted `reservation_items` keep the requested `quantity` and catalogue `unit_price_minor`, while `total_price_minor` reflects only billable units. The DB check allows `total ≤ unit × quantity` with totals that are multiples of the unit price (included free units).

## Quote calculation

Pure function: `calculateQuote()` in `src/features/pricing/domain/calculate-quote.ts`

Orchestrators:

- `AvailabilityService.getTransferOptions()` — location-based vehicle options (quote workflow)
- `QuoteService.calculateTransferQuote()` — explicit vehicle/extra selection pricing (reservation workflow)

```
total = sum(vehicle line items) + sum(extra line items)
```

All arithmetic via `src/lib/money.ts` using integer minor units.

## Availability workflow

`AvailabilityService` in `src/features/pricing/server/availability-service.ts`:

1. Resolve active route from pickup/dropoff locations
2. Batch-load vehicle options with prices and translations
3. Run `recommendVehicles({ includeIneligible: true })` — skips categories below passenger count; still includes cabin-luggage `INELIGIBLE` options as disabled cards
4. Price each option via `calculateQuote()` with auto-injected required extras
5. Attach customer-selectable optional extras
6. Return public DTO (no internal DB fields)

See [API_CONTRACTS.md](./API_CONTRACTS.md) for the response shape.

## Quote response shape

```typescript
{
  quote: { currency, baseItems, extraItems, subtotalMinor, totalMinor },
  allItems: QuoteLineItem[],
  eligibility: "ELIGIBLE" | "ELIGIBLE_WITH_EXTRAS" | "INELIGIBLE",
  capacityWarnings: CapacityWarning[],
  requiredExtras: { extraServiceId, quantity }[]
}
```

## Arabic locale surcharge

When the booking locale is `ar`, `resolveArabicPricingAdjustments()` applies a **2× multiplier** to:

- All extra service line items (customer-selected and auto-required extras)
- Auto-added luggage overflow fleet vehicles (`isLuggageOverflowVehicle`)

Primary transfer vehicle line items keep matrix prices unchanged. The multiplier is applied in `calculateQuote()` via `pricingAdjustments`; orchestrators pass the booking `locale` from availability and reservation flows.

## Rules

- **Never trust client-supplied prices.** Input schemas have no price fields.
- Prices on active routes/vehicles/extras only (`is_active = true`).
- Currency must be consistent within a quote (no cross-currency arithmetic).
- Default currency: `EUR` (see `src/config/constants.ts`).
- Round trip rejected when `round_trip_price_minor` is null.

## Capacity integration

Before pricing, `assessVehicleCapacity()` runs per vehicle selection. If large luggage overflow requires auto-suggested extras, `QuoteService` merges them into the quote.

Capacity logic lives in `src/features/capacity/domain/` — not inside pricing calculations.

## Module location

- Pure calculator: `src/features/pricing/domain/calculate-quote.ts`
- Guards: `src/features/pricing/domain/guards.ts`
- Availability: `src/features/pricing/server/availability-service.ts`
- Quote orchestrator: `src/features/pricing/server/quote-service.ts`
- Repository: `src/features/pricing/server/repository.ts`
- Reader interface: `src/features/pricing/server/reader.ts`
- Input schemas: `src/features/pricing/schemas/quote.ts`, `availability.ts` — quote requests enforce the same `MIN_BOOKING_LEAD_MINUTES` minimum as reservations
- DTOs: `src/features/pricing/types/dto.ts`

## Testing

Unit tests cover:

- One-way and round-trip pricing
- Per-vehicle-category price differences
- Fixed and per-unit extras
- Currency mismatch rejection
- Route validity and active-state guards
- Reservation snapshot mapping
