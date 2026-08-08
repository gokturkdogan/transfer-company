-- Idempotent hierarchy backfill (run after 0003)
-- Creates CITY locations from regions, links airports/districts, converts REGION -> DISTRICT

INSERT INTO locations (id, type, code, default_name, sort_order, is_active, created_at, updated_at)
SELECT
  gen_random_uuid(),
  'CITY'::location_type,
  r.code,
  COALESCE(
    (SELECT rt.name FROM region_translations rt WHERE rt.region_id = r.id AND rt.locale = 'tr' LIMIT 1),
    r.code
  ),
  0,
  r.is_active,
  NOW(),
  NOW()
FROM regions r
WHERE NOT EXISTS (
  SELECT 1 FROM locations l WHERE l.type = 'CITY' AND l.code = r.code
);

UPDATE locations airport
SET parent_id = city.id
FROM locations city
WHERE airport.type = 'AIRPORT'
  AND airport.region_id IS NOT NULL
  AND city.type = 'CITY'
  AND city.code = (SELECT r.code FROM regions r WHERE r.id = airport.region_id)
  AND airport.parent_id IS NULL;

UPDATE locations district
SET parent_id = city.id
FROM locations city
WHERE district.type IN ('REGION', 'DISTRICT')
  AND district.region_id IS NOT NULL
  AND city.type = 'CITY'
  AND city.code = (SELECT r.code FROM regions r WHERE r.id = district.region_id)
  AND district.parent_id IS NULL;

UPDATE locations SET type = 'DISTRICT' WHERE type = 'REGION';

UPDATE locations hotel
SET parent_id = district.id
FROM locations district
WHERE hotel.type = 'HOTEL'
  AND hotel.region_id IS NOT NULL
  AND district.type = 'DISTRICT'
  AND district.region_id = hotel.region_id
  AND district.code != hotel.code
  AND hotel.parent_id IS NULL
  AND district.id = (
    SELECT d2.id FROM locations d2
    WHERE d2.type = 'DISTRICT' AND d2.region_id = hotel.region_id
    ORDER BY d2.sort_order, d2.default_name
    LIMIT 1
  );
