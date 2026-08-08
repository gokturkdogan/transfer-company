import "server-only";

import type { Database } from "@/db/client";

export class VehicleRepository {
  constructor(private readonly database: Database) {}
}
