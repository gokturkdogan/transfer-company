import "server-only";

import { ExtraServiceRepository } from "./repository";

export class ExtraServiceService {
  constructor(private readonly repository: ExtraServiceRepository) {}
}
