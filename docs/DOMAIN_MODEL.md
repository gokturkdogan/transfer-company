# Domain Model

## Core entities

### Regions & Locations

- **Region** (legacy table): geographic grouping retained for FK compatibility; no longer drives the hierarchy
- **Location**: self-referential hierarchy via `parentId`
- **LocationTranslation**: localized name, slug, description per locale

Location fields: `type`, `defaultName`, `parentId`, optional legacy `regionId`, optional `address`, optional `latitude`/`longitude`, `sortOrder`, soft-delete state.

### Hierarchy (Phase 5)

```
CITY (parentId = null)
  ├── AIRPORT
  └── DISTRICT
        └── HOTEL
```

Supported location types: `CITY`, `DISTRICT`, `AIRPORT`, `HOTEL`, `TRANSFER_POINT`, `MARINA`, `CUSTOM_LOCATION`. `REGION` is deprecated (enum retained in PostgreSQL).

**Transfer zones:** `DISTRICT` rows under Antalya city are customer-facing transfer zones (e.g. `KUNDU_LARA`, `COLAKLI_SIDE`), not official ilçe boundaries. Canonical list: `scripts/data/transfer-zones.ts`. Re-seed with `npm run db:migrate:transfer-zones`.

### Pricing vs drop-off

| Concept | Source | Affects price |
|---------|--------|---------------|
| Quote route | Airport → District | Yes |
| Hotel drop-off | `hotelLocationId` on reservation | No |
| Custom drop-off | `customDestination` on reservation | No |

Reservations store `pickupLocationId` (airport) and `dropoffLocationId` (district) plus optional `hotelLocationId`, custom destination fields, and `snapshotDropoffLabel`.

### Vehicles

- **VehicleCategory**: pricing/capacity unit (not individual fleet vehicle)
- **VehicleCategoryTranslation**: localized name, short description, description

Capacity fields: `passengerCapacity`, `largeLuggageCapacity`, `cabinLuggageCapacity`.

### Routes & Pricing

- **Route**: directed pair of locations (origin → destination). A→B and B→A are independent.
- **RoutePrice**: one row per (route, vehicle category) with `oneWayPriceMinor`, nullable `roundTripPriceMinor`, shared `currency`.

### Extras

- **ExtraService**: reusable add-on domain (luggage vehicle is NOT a special case)
- **ExtraServiceTranslation**: localized name and description

Extra fields include `pricingMode` (`FIXED` | `PER_UNIT`), `customerSelectable`, `autoSuggested`, `minQuantity`, `maxQuantity`, optional `luggageCapacityPerUnit`.

### Customers & Reservations

- **Customer**: booking contact (no auth/account system)
- **Reservation**: transfer request with trip metadata and immutable totals
- **ReservationItem**: line items of type `TRANSFER_VEHICLE` or `EXTRA_SERVICE` with snapshot pricing

Reservation passenger names are stored in `passenger_details` (JSON array of `{ kind, index, fullName, idDocument? }`). `notes` is free-text customer notes only and must not contain passenger identity blocks.

## Reservation lifecycle

```
PENDING → CONFIRMED → COMPLETED
         ↘ CANCELLED
```

Online payment is **not** part of the system. A reservation is initially only a request.

## Trip types

- `ONE_WAY`: single transfer with `outboundAt`
- `ROUND_TRIP`: outbound + return with `outboundAt` and required `returnAt`

## Capacity invariants

- Passenger overflow is **never** solvable by a luggage vehicle → `INELIGIBLE`
- Cabin luggage overflow is **never** solvable by a luggage vehicle → `INELIGIBLE`
- Large luggage overflow is resolved by the **cheapest priced fleet vehicle** on the same route (route matrix price × quantity needed), not a separate extra catalogue price
- Required luggage fleet: `selectCheapestLuggageFleetVehicle(overflow, fleet options, tripType)` — minimum total route price among active priced categories
- Eligibility states: `ELIGIBLE`, `ELIGIBLE_WITH_EXTRAS`, `INELIGIBLE`

## Multi-vehicle support

Reservations use `reservation_items` rows with quantity. A booking may include multiple vehicle category line items (e.g. 2 × Vito). Recommendation logic computes minimum vehicle quantity per category.

## Historical integrity

Reservations store **snapshots** via `reservation_items`:

- Display name at booking time
- Unit price and total price per line item
- Reservation-level `snapshotRouteLabel` (airport → district), `snapshotDropoffLabel` (hotel or custom name), `subtotalMinor`, `totalMinor`, `currency`

If admin changes prices, vehicle names, or location names later, existing reservations remain unchanged.

## Soft delete

Any entity referenced by historical reservations must not be hard-deleted. Use `isActive` + `deletedAt`. Deactivation hides entities from new bookings but preserves referential integrity.

## ID strategy

- Internal IDs: UUID (`defaultRandom()`)
- Public reservation reference: separate human-readable code (e.g. `TR-8F3K2M`)
- Never expose sequential database IDs publicly

## Money

All prices stored as **integer minor units** (e.g. `4500` = €45.00) with a `currency` char(3) column. See [PRICE_ENGINE.md](./PRICE_ENGINE.md).
