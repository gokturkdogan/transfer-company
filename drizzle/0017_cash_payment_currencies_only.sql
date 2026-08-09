-- enabled_currencies holds cash payment options at the vehicle only (not EUR pricing).
DELETE FROM "enabled_currencies" WHERE "code" = 'EUR';
