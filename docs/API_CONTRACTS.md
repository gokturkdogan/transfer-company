# API Contracts

Public booking APIs are exposed as Route Handlers under `/api/`. All responses use the `ActionResult<T>` envelope:

```json
{ "success": true, "data": { ... } }
```

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "fieldErrors": { "outboundAt": ["..."] }
  }
}
```

## POST `/api/quote`

Returns vehicle options for a route resolved from airport and district.

### Request

```json
{
  "originAirportId": "uuid",
  "destinationDistrictId": "uuid",
  "tripType": "ONE_WAY",
  "outboundAt": "2026-08-10T14:30",
  "returnAt": "2026-08-12T10:00",
  "passengerCount": 3,
  "largeLuggageCount": 2,
  "cabinLuggageCount": 1,
  "locale": "en"
}
```

- `outboundAt` / `returnAt` are **wall-clock datetimes** in `Europe/Istanbul` (`YYYY-MM-DDTHH:mm`)
- No price fields accepted
- Optional `selection` for priced requote when extras change:

```json
{
  "selection": {
    "vehicleCategoryId": "uuid",
    "quantity": 1,
    "extras": [{ "extraServiceId": "uuid", "quantity": 1 }]
  }
}
```

When `selection` is present, the response includes `data.selection` (priced via `QuoteService.calculateTransferQuote()`) in addition to `options`.

### Response

```json
{
  "success": true,
  "data": {
    "routeId": "uuid",
    "currency": "EUR",
    "timeZone": "Europe/Istanbul",
    "options": [
      {
        "vehicleCategoryId": "uuid",
        "name": "Mercedes Vito",
        "quantity": 1,
        "passengerCapacity": 8,
        "largeLuggageCapacity": 8,
        "cabinLuggageCapacity": 2,
        "eligibility": "ELIGIBLE_WITH_EXTRAS",
        "requiredLuggageVehicles": 1,
        "warnings": [],
        "requiredExtras": [
          {
            "extraServiceId": "uuid",
            "name": "Luggage Van",
            "pricingMode": "PER_UNIT",
            "quantity": 1,
            "unitPriceMinor": 2500,
            "totalPriceMinor": 2500,
            "required": true
          }
        ],
        "optionalExtras": [],
        "quote": {
          "currency": "EUR",
          "baseItems": [],
          "extraItems": [],
          "subtotalMinor": 12500,
          "totalMinor": 12500
        }
      }
    ]
  }
}
```

### Eligibility states

| API value | Equivalent prompt term | Meaning |
|-----------|------------------------|---------|
| `ELIGIBLE` | `SUITABLE` | Fits passengers and luggage |
| `ELIGIBLE_WITH_EXTRAS` | `SUITABLE_WITH_EXTRA_LUGGAGE` | Fits with required luggage vehicle extra(s) |
| `INELIGIBLE` | `NOT_SUITABLE` | Cannot be booked (e.g. passenger or cabin luggage overflow) |

`INELIGIBLE` options are included for transparency but must not be selectable in the UI.

## POST `/api/reservations`

Creates a reservation request. Requires `Idempotency-Key` header.

### Headers

| Header | Required | Description |
|--------|----------|-------------|
| `Idempotency-Key` | Yes | Client-generated key (max 64 chars) |
| `Content-Type` | Yes | `application/json` |

### Request

```json
{
  "routeId": "uuid",
  "originAirportId": "uuid",
  "destinationDistrictId": "uuid",
  "hotelLocationId": "uuid",
  "customDestination": {
    "name": "Private Villa",
    "address": "Optional address"
  },
  "tripType": "ONE_WAY",
  "outboundAt": "2026-08-10T14:30",
  "returnAt": null,
  "outboundFlightNumber": "TK1234",
  "returnFlightNumber": null,
  "passengerCount": 3,
  "largeLuggageCount": 2,
  "cabinLuggageCount": 1,
  "vehicles": [{ "vehicleCategoryId": "uuid", "quantity": 1 }],
  "extras": [{ "extraServiceId": "uuid", "quantity": 1 }],
  "customer": {
    "firstName": "Ada",
    "lastName": "Lovelace",
    "email": "ada@example.com",
    "phone": "+905551112233",
    "whatsappPhone": "+905551112233"
  },
  "notes": "Meet at arrivals",
  "passengers": [
    { "kind": "adult", "index": 1, "fullName": "Ada Lovelace", "idDocument": "12345678901" },
    { "kind": "adult", "index": 2, "fullName": "Grace Hopper" },
    { "kind": "child", "index": 1, "fullName": "Child Name" }
  ],
  "locale": "en",
  "clientQuotedTotalMinor": 12500,
  "website": "",
  "formStartedAt": 1710000000000
}
```

- `passengers` is required; length must equal `passengerCount + infantCount` (children are included in `passengerCount`)
- `notes` is free-text customer notes only — passenger names are stored separately in `passenger_details`
- `clientQuotedTotalMinor` is informational only; server recalculates and ignores mismatches
- `hotelLocationId` and `customDestination` are mutually exclusive
- When `hotelLocationId` is set, server verifies hotel is active and belongs to `destinationDistrictId`
- `website` honeypot must be empty
- `formStartedAt` is used for minimum fill-time anti-spam (3 seconds)

### Response

```json
{
  "success": true,
  "data": {
    "reference": "TR-A8X42K",
    "status": "PENDING",
    "tripType": "ONE_WAY",
    "outboundAt": "2026-08-10T14:30",
    "returnAt": null,
    "subtotalMinor": 12500,
    "totalMinor": 12500,
    "currency": "EUR",
    "timeZone": "Europe/Istanbul",
    "items": [
      {
        "type": "TRANSFER_VEHICLE",
        "name": "Mercedes Vito",
        "quantity": 1,
        "unitPriceMinor": 10000,
        "totalPriceMinor": 10000
      }
    ]
  }
}
```

No customer PII or internal UUIDs are returned.

## Error contract

| HTTP | Code | When |
|------|------|------|
| 400 | `VALIDATION_ERROR` | Zod / input validation failure |
| 404 | `NOT_FOUND` | Resource not found |
| 409 | `DOMAIN_RULE_VIOLATION` | Idempotency key reused with different payload |
| 422 | `DOMAIN_RULE_VIOLATION` | Business rule violation (inactive route, over-capacity, etc.) |
| 429 | `DOMAIN_RULE_VIOLATION` | Rate limit exceeded |
| 500 | `UNKNOWN_ERROR` / `INFRASTRUCTURE_ERROR` | Unexpected server error (safe message only) |

Rate limit headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`, `Retry-After`.

## Idempotency

1. Client sends `Idempotency-Key` header with every reservation request
2. Server claims the key in `reservation_idempotency_keys` before creating the reservation
3. Duplicate key with **same** payload → returns existing reservation (HTTP 200)
4. Duplicate key with **different** payload → HTTP 409
5. Keys expire after 24 hours

## Timezone

- Business timezone: `Europe/Istanbul` (`PROJECT_TIME_ZONE`)
- Client sends wall-clock datetimes as `YYYY-MM-DDTHH:mm`
- Server converts to UTC `timestamptz` for storage
- API responses render datetimes back in `Europe/Istanbul`

## Rate limits

| Endpoint | Policy |
|----------|--------|
| `POST /api/quote` | 30 requests / minute / IP |
| `POST /api/reservations` | 10 requests / hour / IP + 5 / hour / email |
| `GET /api/locations/hotels` | 30 requests / minute / IP |

Implemented via Postgres `rate_limit_buckets` table (fixed-window counters).

## GET `/api/locations/hotels`

Returns active hotels for a district. Used in booking Step 4 after district selection.

### Query parameters

| Param | Required | Description |
|-------|----------|-------------|
| `districtId` | Yes | UUID of the pricing district |
| `locale` | No | Defaults to `en` |

### Response

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Maxx Royal",
      "address": "Belek",
      "districtId": "uuid",
      "sortOrder": 0
    }
  ]
}
```

## Locations (Server Component)

Airports, cities, and districts load via `LocationService` in booking page Server Components — **no HTTP endpoint** for those. Hotels load client-side via `GET /api/locations/hotels`. See [BOOKING_UI.md](./BOOKING_UI.md).
