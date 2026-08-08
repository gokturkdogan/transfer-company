import "server-only";

import { CustomerRepository } from "./repository";

export class CustomerService {
  constructor(private readonly repository: CustomerRepository) {}
}
