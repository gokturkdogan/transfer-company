import "server-only";

import type { Database } from "@/db/client";

export class ExtraServiceRepository {
  constructor(private readonly database: Database) {}
}
