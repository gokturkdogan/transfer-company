import "server-only";

import { VehicleRepository } from "./repository";

export class VehicleService {
  constructor(private readonly repository: VehicleRepository) {}
}
