import "server-only";

import { PricingRepository } from "./repository";

export class PricingService {
  constructor(private readonly repository: PricingRepository) {}

  // Price calculation rules will be implemented in Phase 2.
}

export function createPricingService(repository: PricingRepository) {
  return new PricingService(repository);
}
