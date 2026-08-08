import "server-only";

import type { Database } from "@/db/client";

export class CustomerRepository {
  constructor(private readonly database: Database) {}
}
